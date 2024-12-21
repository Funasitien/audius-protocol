/*
 * This file is autogenerated by ./scripts/generateServicesConfig.ts.
 * DO NOT EDIT MANUALLY!
 */
/* eslint-disable prettier/prettier */
import type { SdkServicesConfig } from './types'
export const developmentConfig: SdkServicesConfig = {
  network: {
    minVersion: '0.0.0',
    discoveryNodes: [
      {
        delegateOwnerWallet:
          '0xd09ba371c359f10f22ccda12fd26c598c7921bda3220c9942174562bc6a36fe8',
        endpoint: 'http://audius-protocol-discovery-provider-1',
        ownerWallet:
          '0xd09ba371c359f10f22ccda12fd26c598c7921bda3220c9942174562bc6a36fe8'
      }
    ],
    storageNodes: [
      {
        delegateOwnerWallet: '0x0D38e653eC28bdea5A2296fD5940aaB2D0B8875c',
        endpoint: 'http://audius-protocol-creator-node-1'
      }
    ],
    antiAbuseOracleNodes: {
      endpoints: ['http://audius-protocol-anti-abuse-oracle-1:8000'],
      registeredAddresses: ['0xF0D5BC18421fa04D0a2A2ef540ba5A9f04014BE3']
    },
    identityService: 'https://audius-protocol-identity-service-1'
  },
  acdc: {
    entityManagerContractAddress: '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B',
    chainId: 1337
  },
  solana: {
    claimableTokensProgramAddress:
      'testHKV1B56fbvop4w6f2cTGEub9dRQ2Euta5VmqdX9',
    rewardManagerProgramAddress: 'testLsJKtyABc9UXJF8JWFKf1YH4LmqCWBC42c6akPb',
    rewardManagerStateAddress: 'DJPzVothq58SmkpRb1ATn5ddN2Rpv1j2TcGvM3XsHf1c',
    paymentRouterProgramAddress: 'apaySbqV1XAmuiGszeN4NyWrXkkMrnuJVoNhzmS1AMa',
    stakingBridgeProgramAddress: '',
    rpcEndpoint: 'http://audius-protocol-solana-test-validator-1',
    usdcTokenMint: '26Q7gP8UfkDzi7GMFEQxTJaNJ8D2ybCUjex58M5MLu8y',
    wAudioTokenMint: '37RCjhgV1qGV2Q54EHFScdxZ22ydRMdKMtVgod47fDP3',
    rewardManagerLookupTableAddress:
      'GNHKVSmHvoRBt1JJCxz7RSMfzDQGDGhGEjmhHyxb3K5J'
  },
  ethereum: {
    rpcEndpoint: 'https://audius-protocol-eth-ganache-1',
    addresses: {
      ethRewardsManagerAddress: '0x',
      serviceProviderFactoryAddress: '0x',
      serviceTypeManagerAddress: '0x',
      audiusTokenAddress: '0xdcB2fC9469808630DD0744b0adf97C0003fC29B2',
      audiusWormholeAddress: '0xf6f45e4d836da1d4ecd43bb1074620bfb0b7e0d7'
    }
  }
}
