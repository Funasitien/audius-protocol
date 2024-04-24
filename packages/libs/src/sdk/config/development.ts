/*
 * This file is autogenerated by ./scripts/generateServicesConfig.ts.
 * DO NOT EDIT MANUALLY!
 */
/* eslint-disable prettier/prettier */
import type { ServicesConfig } from './types'
export const servicesConfig: ServicesConfig = {
  "minVersion": "0.0.0",
  "discoveryNodes": [
    {
      "delegateOwnerWallet": "0xd09ba371c359f10f22ccda12fd26c598c7921bda3220c9942174562bc6a36fe8",
      "endpoint": "http://audius-protocol-discovery-provider-1",
      "ownerWallet": "0xd09ba371c359f10f22ccda12fd26c598c7921bda3220c9942174562bc6a36fe8"
    }
  ],
  "storageNodes": [
    {
      "delegateOwnerWallet": "0x0D38e653eC28bdea5A2296fD5940aaB2D0B8875c",
      "endpoint": "http://audius-protocol-creator-node-1"
    }
  ],
  "entityManagerContractAddress": "0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B",
  "web3ProviderUrl": "http://audius-protocol-poa-ganache-1",
  "identityServiceUrl": "http://audius-protocol-identity-service-1",
  "antiAbuseOracleNodes": {
    "endpoints": [
      "http://audius-protocol-anti-abuse-oracle-1:8000"
    ],
    "registeredAddresses": [
      "0xF0D5BC18421fa04D0a2A2ef540ba5A9f04014BE3"
    ]
  }
}
