import {
  Hedgehog as HedgehogBase,
  WalletManager,
  getPlatformCreateKey
} from '@audius/hedgehog'
import type { SetAuthFn, SetUserFn, GetFn, CreateKey } from '@audius/hedgehog'

import type { LocalStorage } from '../../utils/localStorage'
import type { IdentityService } from '../identity'

export type HedgehogConfig = {
  identityService: IdentityService
  useLocalStorage?: boolean
  localStorage?: LocalStorage
  createKey?: CreateKey
}

const walletEventMethods = [
  'signUp',
  'login',
  'logout',
  'resetPassword',
  'changeCredentials',
  'createWalletObj'
] as const

// Utility function to wrap methods on HedgehogBase that modify the wallet
// and dispatch an event afterwards
function wrapAndNotify(
  obj: HedgehogBase,
  methodName: keyof HedgehogBase
): void {
  const originalMethod = obj[methodName] as Function

  // @ts-expect-error -- Not worth getting the types right for this
  obj[methodName] = async function (this: HedgehogBase, ...args: any[]) {
    const result = await originalMethod.apply(this, args)

    try {
      console.debug(`Dispatching hedgehogWalletUpdate event for ${methodName}`)
      const event = new Event('hedgehogWalletUpdate')
      window.dispatchEvent(event)
    } catch (e) {
      // Don't prevent original method from returning if event dispatch errors
    }

    // Return the original result
    return result
  }
}

export class Hedgehog {
  identityService: IdentityService
  getFn: IdentityService['getFn']
  setAuthFn: SetAuthFn
  setUserFn: SetUserFn
  instance: HedgehogBase

  // TODO - update this comment

  // This is some black magic going on here. The audiusServiceEndpoint is passed in along with the
  // requestToAudiusService function reference. When setFn and getFn call self.requestToAudiusService,
  // the context of `this` that's used is the HedgehogWrapper class, not the AudiusWeb3 class.
  // Therefore, we need to define this.audiusServiceEndpoint, to satisfy all the deps of the
  // requestToAudiusService and make it execute correctly

  constructor({
    identityService,
    useLocalStorage = true,
    localStorage,
    createKey = getPlatformCreateKey()
  }: HedgehogConfig) {
    this.identityService = identityService

    this.getFn = async (obj) => {
      return await this.identityService.getFn(obj)
    }

    this.setAuthFn = async (obj) => {
      return await this.identityService.setAuthFn(obj)
    }

    this.setUserFn = async (obj) => {
      return await this.identityService.setUserFn(obj)
    }

    const hedgehog = new HedgehogBase(
      this.getFn as GetFn,
      this.setAuthFn,
      this.setUserFn,
      useLocalStorage,
      localStorage,
      createKey
    )

    /**
     * Generate secure credentials to allow login
     */
    // @ts-expect-error -- adding our own custom method to hedgehog
    hedgehog.generateRecoveryInfo = async () => {
      const entropy = await WalletManager.getEntropyFromLocalStorage(
        hedgehog.localStorage
      )
      if (entropy === null) {
        throw new Error('generateRecoveryLink - missing entropy')
      }
      let btoa // binary to base64 ASCII conversion
      let currentHost
      if (typeof window !== 'undefined' && window && window.btoa) {
        btoa = window.btoa
        currentHost = window.location.origin
      } else {
        btoa = (str: string) => Buffer.from(str, 'binary').toString('base64')
        currentHost = 'localhost'
      }
      const recoveryInfo = { login: btoa(entropy), host: currentHost }
      return recoveryInfo
    }

    // @ts-expect-error -- adding our own custom method to hedgehog
    hedgehog.getLookupKey = async ({
      username,
      password
    }: {
      username: string
      password: string
    }) => {
      return await WalletManager.createAuthLookupKey(
        username,
        password,
        hedgehog.createKey
      )
    }

    // TODO (PAY-3479): This is temporary until hedgehog is fully moved out of libs
    // Add events for methods that modify the wallet so that other instances can sync
    walletEventMethods.forEach((fnName) => wrapAndNotify(hedgehog, fnName))

    this.instance = hedgehog
  }
}
