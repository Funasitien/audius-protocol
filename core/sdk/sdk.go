//go:generate go run ../scripts/generate_options.go Sdk sdk_options.go

package sdk

import (
	"github.com/AudiusProject/audius-protocol/core/gen/proto"
	"github.com/cometbft/cometbft/rpc/client/http"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Sdk struct {
	logger       Logger
	privKey      string
	GRPCEndpoint string
	JRPCEndpoint string
	proto.ProtocolClient
	http.HTTP
}

func defaultSdk() *Sdk {
	return &Sdk{
		logger: NewNoOpLogger(),
	}
}

func initSdk(sdk *Sdk) error {
	// TODO: add default environment here if not set

	// TODO: add node selection logic here, based on environement, if endpoint not configured

	// initialize grpc client
	if sdk.GRPCEndpoint != "" {
		grpcConn, err := grpc.NewClient(sdk.GRPCEndpoint, grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			return err
		}
		// TODO: add signing middleware here if privkey
		grpcClient := proto.NewProtocolClient(grpcConn)
		sdk.ProtocolClient = grpcClient
	}

	// initialize jsonrpc client
	if sdk.JRPCEndpoint != "" {
		jrpcConn, err := http.New(sdk.JRPCEndpoint)
		if err != nil {
			return err
		}
		sdk.HTTP = *jrpcConn
	}

	if sdk.privKey == "" {
		sdk.logger.Info("private key not supplied to sdk, only reads allowed")
	}

	return nil
}