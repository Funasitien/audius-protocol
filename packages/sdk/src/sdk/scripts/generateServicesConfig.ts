import { promises } from 'fs'
import path from 'path'

import type { SdkServicesConfig } from '../config/types'
import {
  EthRewardsManagerClient,
  getDefaultEthRewardsManagerConfig,
  getDefaultServiceProviderFactoryConfig,
  getDefaultServiceTypeManagerConfig,
  ServiceProviderFactoryClient,
  ServiceTypeManagerClient
} from '../services/Ethereum'

const { writeFile } = promises

const productionConfig: SdkServicesConfig = {
  network: {
    minVersion: '',
    discoveryNodes: [],
    storageNodes: [],
    antiAbuseOracleNodes: {
      endpoints: [
        'https://antiabuseoracle.audius.co',
        'https://audius-oracle.creatorseed.com',
        'https://oracle.audius.endl.net'
      ],
      registeredAddresses: []
    },
    identityService: 'https://identityservice.audius.co'
  },
  acdc: {
    entityManagerContractAddress: '0x1Cd8a543596D499B9b6E7a6eC15ECd2B7857Fd64',
    web3ProviderUrl: 'https://poa-gateway.audius.co'
  },
  solana: {
    claimableTokensProgramAddress:
      'Ewkv3JahEFRKkcJmpoKB7pXbnUHwjAyXiwEo4ZY2rezQ',
    rewardManagerProgramAddress: 'DDZDcYdQFEMwcu2Mwo75yGFjJ1mUQyyXLWzhZLEVFcei',
    rewardManagerStateAddress: '71hWFVYokLaN1PNYzTAWi13EfJ7Xt9VbSWUKsXUT8mxE',
    paymentRouterProgramAddress: 'paytYpX3LPN98TAeen6bFFeraGSuWnomZmCXjAsoqPa',
    stakingBridgeProgramAddress: 'stkB5DZziVJT1C1VmzvDdRtdWxfs5nwcHViiaNBDK31',
    rpcEndpoint: 'https://audius-fe.rpcpool.com',
    usdcTokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    wAudioTokenMint: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM'
  },
  ethereum: {
    rpcEndpoint: 'https://eth.audius.co',
    ethRewardsManagerAddress: '',
    serviceProviderFactoryAddress: '',
    serviceTypeManagerAddress: ''
  }
}

const stagingConfig: SdkServicesConfig = {
  network: {
    minVersion: '',
    discoveryNodes: [],
    storageNodes: [],
    antiAbuseOracleNodes: {
      endpoints: ['https://antiabuseoracle.staging.audius.co'],
      registeredAddresses: []
    },
    identityService: 'https://identityservice.staging.audius.co'
  },
  acdc: {
    entityManagerContractAddress: '0x1Cd8a543596D499B9b6E7a6eC15ECd2B7857Fd64',
    web3ProviderUrl: 'https://poa-gateway.staging.audius.co'
  },
  solana: {
    claimableTokensProgramAddress:
      '2sjQNmUfkV6yKKi4dPR8gWRgtyma5aiymE3aXL2RAZww',
    rewardManagerProgramAddress: 'CDpzvz7DfgbF95jSSCHLX3ERkugyfgn9Fw8ypNZ1hfXp',
    rewardManagerStateAddress: 'GaiG9LDYHfZGqeNaoGRzFEnLiwUT7WiC6sA6FDJX9ZPq',
    paymentRouterProgramAddress: 'sp28KA2bTnTA4oSZ3r9tTSKfmiXZtZQHnYYQqWfUyVa',
    stakingBridgeProgramAddress: 'stkuyR7dTzxV1YnoDo5tfuBmkuKn7zDatimYRDTmQvj',
    rpcEndpoint: 'https://audius-fe.rpcpool.com',
    usdcTokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    wAudioTokenMint: 'BELGiMZQ34SDE6x2FUaML2UHDAgBLS64xvhXjX5tBBZo'
  },
  ethereum: {
    rpcEndpoint: 'https://eth.staging.audius.co',
    ethRewardsManagerAddress: '',
    serviceProviderFactoryAddress: '',
    serviceTypeManagerAddress: ''
  }
}

const developmentConfig: SdkServicesConfig = {
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
    web3ProviderUrl: 'http://audius-protocol-poa-ganache-1'
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
    wAudioTokenMint: '37RCjhgV1qGV2Q54EHFScdxZ22ydRMdKMtVgod47fDP3'
  },
  ethereum: {
    rpcEndpoint: 'https://audius-protocol-eth-ganache-1',
    ethRewardsManagerAddress: '',
    serviceProviderFactoryAddress: '',
    serviceTypeManagerAddress: ''
  }
}

const generateServicesConfig = async (
  config: SdkServicesConfig
): Promise<SdkServicesConfig> => {
  const serviceProviderFactory = new ServiceProviderFactoryClient(
    getDefaultServiceProviderFactoryConfig(config)
  )
  const ethRewardsManager = new EthRewardsManagerClient(
    getDefaultEthRewardsManagerConfig(config)
  )
  const serviceTypeManager = new ServiceTypeManagerClient(
    getDefaultServiceTypeManagerConfig(config)
  )

  const discoveryNodes = await serviceProviderFactory.getDiscoveryNodes()
  if (!discoveryNodes || discoveryNodes.length === 0) {
    throw Error('Discovery node services not found')
  }
  const contentNodes = await serviceProviderFactory.getContentNodes()
  if (!contentNodes || contentNodes.length === 0) {
    throw Error('Storage node services not found')
  }
  const antiAbuseAddresses =
    await ethRewardsManager.contract.getAntiAbuseOracleAddresses()

  if (!antiAbuseAddresses || antiAbuseAddresses.length === 0) {
    throw Error('Anti Abuse node services not found')
  }

  const minVersion = await serviceTypeManager.getDiscoveryNodeVersion()

  config.network.minVersion = minVersion
  config.network.discoveryNodes = discoveryNodes.map((n: any) => ({
    endpoint: n.endpoint,
    ownerWallet: n.owner,
    delegateOwnerWallet: n.delegateOwnerWallet
  }))
  config.network.storageNodes = contentNodes.map((n: any) => ({
    endpoint: n.endpoint,
    delegateOwnerWallet: n.delegateOwnerWallet
  }))
  config.network.antiAbuseOracleNodes.registeredAddresses = antiAbuseAddresses

  return config
}

const writeServicesConfig = async () => {
  const production = await generateServicesConfig(productionConfig)
  const staging = await generateServicesConfig(stagingConfig)
  const development = developmentConfig
  const config: Record<string, SdkServicesConfig> = {
    development,
    staging,
    production
  }
  for (const env of Object.keys(config)) {
    await writeFile(
      path.resolve(__dirname, `../config/${env}.ts`),
      `/*
 * This file is autogenerated by ./scripts/generateServicesConfig.ts.
 * DO NOT EDIT MANUALLY!
 */
/* eslint-disable prettier/prettier */
import type { SdkServicesConfig } from './types'
export const ${env}Config: SdkServicesConfig = ${JSON.stringify(
        config[env],
        undefined,
        2
      )}
`
    )
  }
}

writeServicesConfig()
