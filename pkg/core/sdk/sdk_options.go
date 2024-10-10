// Code generated by generate_options.go; DO NOT EDIT.
// Auto-generated file for Sdk struct options pattern.

package sdk


type SdkOption func(*Sdk)

func NewSdk(opts ...SdkOption) (*Sdk, error) {
	s := defaultSdk()
	for _, opt := range opts {
		opt(s)
	}
	if err := initSdk(s); err != nil {
		return nil, err
	}
	return s, nil
}
func WithLogger(logger Logger) SdkOption {
	return func(s *Sdk) {
		s.logger = logger
	}
}

func WithPrivkey(privKey string) SdkOption {
	return func(s *Sdk) {
		s.privKey = privKey
	}
}

func WithGrpcendpoint(GRPCEndpoint string) SdkOption {
	return func(s *Sdk) {
		s.GRPCEndpoint = GRPCEndpoint
	}
}

func WithJrpcendpoint(JRPCEndpoint string) SdkOption {
	return func(s *Sdk) {
		s.JRPCEndpoint = JRPCEndpoint
	}
}
