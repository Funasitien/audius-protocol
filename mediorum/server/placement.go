package server

import (
	"errors"
	"time"

	"github.com/AudiusProject/audius-protocol/mediorum/cidutil"
	"github.com/tysonmote/rendezvous"
	"golang.org/x/exp/slices"
)

func (ss *MediorumServer) rendezvousAllHosts(key string) ([]string, bool) {
	allHosts := []string{}
	for _, peer := range ss.Config.Peers {
		allHosts = append(allHosts, peer.Host)
	}
	return ss.rendezvousHosts(key, allHosts)
}

func (ss *MediorumServer) rendezvousHealthyHosts(key string) ([]string, bool) {
	return ss.rendezvousHosts(key, ss.findHealthyPeers(1*time.Hour))
}

func (ss *MediorumServer) rendezvousPlacement(key string) ([]string, bool, error) {
	if isPlaced, placement, key := cidutil.ParsePlacedCID(key); isPlaced {
		hosts, err := cidutil.DecodePlacementHosts(placement)
		if err != nil {
			return nil, false, err
		}
		hashRing := rendezvous.New(hosts...)
		orderedHosts := hashRing.GetN(len(hosts), key)

		myRank := slices.Index(orderedHosts, ss.Config.Self.Host)
		isMine := myRank >= 0 && myRank < ss.Config.ReplicationFactor
		return orderedHosts, isMine, nil
	}
	// this shouldn't happen!
	return nil, false, errors.New("CID does not have placement info")
}

func (ss *MediorumServer) rendezvousHosts(key string, hosts []string) ([]string, bool) {
	if slices.Index(hosts, ss.Config.Self.Host) == -1 {
		hosts = append(hosts, ss.Config.Self.Host)
	}

	hashRing := rendezvous.New(hosts...)
	orderedHosts := hashRing.GetN(len(hosts), key)

	myRank := slices.Index(orderedHosts, ss.Config.Self.Host)
	isMine := myRank >= 0 && myRank < ss.Config.ReplicationFactor

	if ss.Config.StoreAll {
		isMine = true
	}
	return orderedHosts, isMine
}
