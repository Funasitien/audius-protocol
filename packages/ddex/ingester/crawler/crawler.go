package crawler

import (
	"context"
	"fmt"
	"ingester/common"
	"log/slog"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Crawler struct {
	s3Client    *s3.S3
	mongoClient *mongo.Client
	rawBucket   string
	cursorsColl *mongo.Collection
	uploadsColl *mongo.Collection
	ctx         context.Context
	logger      *slog.Logger
}

func RunNewCrawler(ctx context.Context) {
	logger := slog.With("service", "crawler")
	s3Client, _ := common.InitS3Client(logger)
	mongoClient := common.InitMongoClient(ctx, logger)
	defer mongoClient.Disconnect(ctx)

	c := &Crawler{
		s3Client:    s3Client,
		mongoClient: mongoClient,
		rawBucket:   common.MustGetenv("AWS_BUCKET_RAW"),
		cursorsColl: mongoClient.Database("ddex").Collection("cursors"),
		uploadsColl: mongoClient.Database("ddex").Collection("uploads"),
		ctx:         ctx,
		logger:      logger,
	}

	ticker := time.NewTicker(3 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			lastPolledTime, err := c.getLastPolledTime()
			if err != nil {
				c.logger.Error("Failed to retrieve s3 raw bucket's last polled time", "error", err)
				continue
			}

			uploads, err := c.pollS3Bucket(lastPolledTime)
			if err != nil {
				c.logger.Error("Error polling S3 bucket", "error", err)
				continue
			}

			if len(uploads) > 0 {
				err = c.persistUploads(uploads)
				if err != nil {
					c.logger.Error("Error inserting into mongodb", "error", err)
					continue
				}
				c.logger.Info(fmt.Sprintf("Processed %d new uploads", len(uploads)))
			}

			err = c.updateLastPolledTime(time.Now())
			if err != nil {
				c.logger.Error("Failed to update s3 raw bucket's last polled time", "error", err)
			}

			if ctx.Err() != nil {
				return
			}
		}
	}
}

func (c *Crawler) updateLastPolledTime(lastPolledTime time.Time) error {
	filter := bson.M{"service": "crawler"}
	update := bson.M{"$set": bson.M{"s3RawLastPolledTime": lastPolledTime}}
	opts := options.Update().SetUpsert(true)

	_, err := c.cursorsColl.UpdateOne(c.ctx, filter, update, opts)
	return err
}

func (c *Crawler) getLastPolledTime() (time.Time, error) {
	var result struct {
		LastPolledTime time.Time `bson:"s3RawLastPolledTime"`
	}
	filter := bson.M{"service": "crawler"}

	err := c.cursorsColl.FindOne(c.ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// No record found, return zero time
			return time.Time{}, nil
		}
		return time.Time{}, err
	}

	return result.LastPolledTime, nil
}

func (c *Crawler) pollS3Bucket(lastPolledTime time.Time) ([]*s3.Object, error) {
	resp, err := c.s3Client.ListObjectsV2(&s3.ListObjectsV2Input{
		Bucket: aws.String(c.rawBucket),
	})
	if err != nil {
		return nil, err
	}

	var newUploads []*s3.Object
	for _, item := range resp.Contents {
		if item.LastModified.After(lastPolledTime) {
			newUploads = append(newUploads, item)
		}
	}
	return newUploads, nil
}

func (c *Crawler) persistUploads(uploads []*s3.Object) error {
	for _, upload := range uploads {
		path := "s3://" + c.rawBucket + "/" + *upload.Key
		etag := strings.Trim(*upload.ETag, "\"")
		// Only insert if a document doesn't already exist with this path and etag
		filter := bson.M{"path": path, "upload_etag": etag}
		update := bson.M{"$setOnInsert": bson.M{"path": path, "upload_etag": etag, "created_at": upload.LastModified}}
		opts := options.Update().SetUpsert(true)
		_, err := c.uploadsColl.UpdateOne(c.ctx, filter, update, opts)
		if err != nil {
			return err
		}
	}
	return nil
}
