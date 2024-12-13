import { IdentityService } from '@audius/common/services'

import { env } from 'app/env'

import { audiusWalletClient } from './auth'

export const identityService = new IdentityService({
  identityServiceEndpoint: env.IDENTITY_SERVICE,
  audiusWalletClient
})
