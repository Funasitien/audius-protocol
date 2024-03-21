import type { Env } from '@audius/common/services'
import Config from 'react-native-config'

export const env: Env = {
  AAO_ENDPOINT: 'https://antiabuseoracle.staging.audius.co',
  AMPLITUDE_API_KEY: '72a58ce4ad1f9bafcba0b92bedb6c33d',
  AMPLITUDE_PROXY: 'https://gain.audius.co',
  AMPLITUDE_WRITE_KEY: Config.AMPLITUDE_WRITE_KEY as string,
  AUDIUS_URL: 'https://staging.audius.co',
  BITSKI_CALLBACK_URL: 'https://staging.audius.co/bitski-callback.html',
  BITSKI_CLIENT_ID: '7a543ec2-b55f-45d6-a5d4-0448c5a23485',
  CACHE_PRUNE_MIN: '250',
  CLAIM_DISTRIBUTION_CONTRACT_ADDRESS:
    '0x74b89B916c97d50557E8F944F32662fE52Ce378d',
  CLAIMABLE_TOKEN_PDA: 'Aw5AjygeMf9Nvg61BXvFSAzkqxcLqL8koepb14kvfc3W',
  CLAIMABLE_TOKEN_PROGRAM_ADDRESS:
    '2sjQNmUfkV6yKKi4dPR8gWRgtyma5aiymE3aXL2RAZww',
  COGNITO_KEY: 'sandbox_publishable_key_e61e1acfe63bd1760827b68d4f00245b',
  COGNITO_TEMPLATE_ID: 'flwtmp_7ZUYaBUFLeNhJw',
  COINFLOW_APP_ID: '9JBW2RHC7JNJN8ZQ',
  COINFLOW_MERCHANT_ID: 'audius',
  COINFLOW_PARTNER_ID: 'AUDIUS',
  EAGER_DISCOVERY_NODES:
    'https://discoveryprovider.staging.audius.co,https://discoveryprovider2.staging.audius.co,https://discoveryprovider3.staging.audius.co',
  ENTITY_MANAGER_ADDRESS: '0x1Cd8a543596D499B9b6E7a6eC15ECd2B7857Fd64',
  ENVIRONMENT: 'staging',
  ETH_BRIDGE_ADDRESS: null,
  ETH_NETWORK_ID: '11155111',
  ETH_OWNER_WALLET: null,
  ETH_PROVIDER_URL: 'https://eth.staging.audius.co',
  ETH_REGISTRY_ADDRESS: '0xc682C2166E11690B64338e11633Cb8Bb60B0D9c0',
  ETH_TOKEN_ADDRESS: '0x1376180Ee935AA64A27780F4BE97726Df7B0e2B2',
  ETH_TOKEN_BRIDGE_ADDRESS: null,
  EXPLORE_CONTENT_URL:
    'https://download.staging.audius.co/static-resources/explore-content.json',
  FCM_PUSH_PUBLIC_KEY: null,
  FINGERPRINT_ENDPOINT: 'https://fp.staging.audius.co',
  FINGERPRINT_PUBLIC_API_KEY: 'Rz2A3Y5YGSg9K80VgKPi',
  GA_HOSTNAME: 'staging.audius.co',
  GA_MEASUREMENT_ID: 'G-CH6BY2X2WL',
  GENERAL_ADMISSION: 'https://general-admission.staging.audius.co',
  HCAPTCHA_BASE_URL: 'https://staging.audius.co',
  HCAPTCHA_SITE_KEY: '2abe61f1-af6e-4707-be19-a9a4146a9bea',
  IDENTITY_SERVICE: 'https://identityservice.staging.audius.co',
  INSTAGRAM_APP_ID: '2875320099414320',
  INSTAGRAM_REDIRECT_URL: 'https://staging.audius.co/',
  METADATA_PROGRAM_ID: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  OPENSEA_API_URL: 'https://rinkeby-api.opensea.io',
  HELIUS_DAS_API_URL: 'https://sol-collectibles.audius.co',
  OPTIMIZELY_KEY: 'MX4fYBgANQetvmBXGpuxzF',
  ORACLE_ETH_ADDRESSES: '0x00b6462e955dA5841b6D9e1E2529B830F00f31Bf',
  PAYMENT_ROUTER_PROGRAM_ID: 'sp38CXGL9FoWPp9Avo4fevewEX4UqNkTSTFUPpQFRry',
  PUBLIC_HOSTNAME: 'staging.audius.co',
  PUBLIC_PROTOCOL: 'https:',
  BASENAME: '/',
  REACHABILITY_URL: 'https://staging.audius.co/204',
  STRIPE_CLIENT_PUBLISHABLE_KEY:
    'pk_test_51LPsGuCJOWtpH6AEZT3Wf2U2xmLZQrEV56yha7HEVTEyhYYVrWCdknml3t4gkSe9Nagd1o9Royy8zL3XEAmRzeHS00xAKTfgpi',
  RECAPTCHA_SITE_KEY: '6LfVR-0ZAAAAADFcqNM1P1IafKwQwN0E_l-gxQ9q',
  REGISTRY_ADDRESS: '0x793373aBF96583d5eb71a15d86fFE732CD04D452',
  REWARDS_MANAGER_PROGRAM_ID: 'CDpzvz7DfgbF95jSSCHLX3ERkugyfgn9Fw8ypNZ1hfXp',
  REWARDS_MANAGER_PROGRAM_PDA: 'GaiG9LDYHfZGqeNaoGRzFEnLiwUT7WiC6sA6FDJX9ZPq',
  REWARDS_MANAGER_TOKEN_PDA: 'HJQj8P47BdA7ugjQEn45LaESYrxhiZDygmukt8iumFZJ',
  SAFARI_WEB_PUSH_ID: 'web.co.audius.staging',
  SCHEME: 'audius-staging',
  SENTRY_DSN: 'https://4b15a7a2f2e2459997408b39a0c4942c@s.audius.co/1851611',
  SOL_BRIDGE_ADDRESS: null,
  SOL_TOKEN_BRIDGE_ADDRESS: null,
  SOLANA_CLUSTER_ENDPOINT: 'https://audius-fe.rpcpool.com',
  SOLANA_FEE_PAYER_ADDRESS: 'E3CfijtAJwBSHfwFEViAUd3xp7c8TBxwC1eXn1Fgxp8h',
  SOLANA_RELAY_ENDPOINT: 'https://discoveryprovider.staging.audius.co',
  SOLANA_TOKEN_PROGRAM_ADDRESS: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  SOLANA_WEB3_CLUSTER: 'mainnet-beta',
  SUGGESTED_FOLLOW_HANDLES:
    'https://download.staging.audius.co/static-resources/signup-follows.json',
  TIKTOK_APP_ID: Config.TIKTOK_APP_ID!,
  TRPC_ENDPOINT: 'https://discoveryprovider3.staging.audius.co/trpc/trpc',
  USDC_MINT_ADDRESS: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USER_NODE: 'https://usermetadata.staging.audius.co',
  USE_HASH_ROUTING: false,
  WAUDIO_MINT_ADDRESS: 'BELGiMZQ34SDE6x2FUaML2UHDAgBLS64xvhXjX5tBBZo',
  WEB3_NETWORK_ID: '77',
  WEB3_PROVIDER_URL: 'https://poa-gateway.staging.audius.co',
  WORMHOLE_ADDRESS: '0xf6f45e4d836da1d4ecd43bb1074620bfb0b7e0d7',
  WORMHOLE_RPC_HOSTS: null
}
