package integration_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/AudiusProject/audius-protocol/core/gen/proto"
	"github.com/AudiusProject/audius-protocol/core/sdk"
)

var _ = Describe("Sdk", func() {
	It("connects to json rpc endpoint", func() {
		ctx := context.Background()

		sdk, err := sdk.NewSdk(sdk.WithGrpcendpoint("core-content-1:6612"), sdk.WithJrpcendpoint("http://core-content-1:6611"))
		Expect(err).To(BeNil())

		// test jsonrpc health route
		_, err = sdk.Health(ctx)
		Expect(err).To(BeNil())

		// test grpc hello route
		res, err := sdk.Ping(ctx, &proto.PingRequest{})
		Expect(err).To(BeNil())
		Expect(res.GetMessage()).To(Equal("pong"))
	})
})
