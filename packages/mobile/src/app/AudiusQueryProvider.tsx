import type { ReactNode } from 'react'

import { AudiusQueryContext } from '@audius/common/audius-query'

import { env } from 'app/env'
import * as analytics from 'app/services/analytics'
import { audiusBackendInstance } from 'app/services/audius-backend-instance'
import {
  getFeatureEnabled,
  remoteConfigInstance
} from 'app/services/remote-config'
import { audiusSdk } from 'app/services/sdk/audius-sdk'
import { authService, solanaWalletService } from 'app/services/sdk/auth'
import { identityService } from 'app/services/sdk/identity'
import { store } from 'app/store'
import { reportToSentry } from 'app/utils/reportToSentry'

type AudiusQueryProviderProps = {
  children: ReactNode
}

export const audiusQueryContext = {
  audiusBackend: audiusBackendInstance,
  audiusSdk,
  authService,
  identityService,
  solanaWalletService,
  dispatch: store.dispatch,
  reportToSentry,
  env,
  fetch,
  remoteConfigInstance,
  getFeatureEnabled,
  analytics
}

export const AudiusQueryProvider = (props: AudiusQueryProviderProps) => {
  const { children } = props
  return (
    <AudiusQueryContext.Provider value={audiusQueryContext}>
      {children}
    </AudiusQueryContext.Provider>
  )
}
