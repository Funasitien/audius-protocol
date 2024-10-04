import type { DiscoveryNode, StorageNode } from '../services'

export type SdkServicesConfig = {
  network: {
    minVersion: string
    discoveryNodes: DiscoveryNode[]
    storageNodes: StorageNode[]
    antiAbuseOracleNodes: {
      registeredAddresses: string[]
      endpoints: string[]
    }
    identityService: string
  }
  acdc: {
    entityManagerContractAddress: string
    web3ProviderUrl: string
  }
  solana: {
    claimableTokensProgramAddress: string
    rewardManagerProgramAddress: string
    rewardManagerStateAddress: string
    paymentRouterProgramAddress: string
    stakingBridgeProgramAddress: string
    rpcEndpoint: string
    usdcTokenMint: string
    wAudioTokenMint: string
  }
  ethereum: {
    rpcEndpoint: string
    addresses: {
      serviceTypeManagerAddress: `0x${string}`
      serviceProviderFactoryAddress: `0x${string}`
      ethRewardsManagerAddress: `0x${string}`
    }
  }
}
