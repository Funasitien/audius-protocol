package main

import (
	"log"
	"os"

	"comms.audius.co/discovery"
	"comms.audius.co/natsd"
	"comms.audius.co/storage"
	"comms.audius.co/trending"
)

func main() {
	subcommand := ""
	if len(os.Args) > 1 {
		subcommand = os.Args[1]
	}
	switch subcommand {
	case "discovery":
		// http
		discovery.DiscoveryMain()
	case "storage":
		// http
		storage.StorageMain()
	case "nats":
		// nats
		natsd.NatsMain()
	case "trending":
		trending.TrendingMain()
	default:
		log.Println("should specify a subcommand like: discovery, storage, nats... falling back to discovery")
		discovery.DiscoveryMain()
	}
}
