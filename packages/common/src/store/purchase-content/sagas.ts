import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { takeLatest } from 'redux-saga/effects'
import { call, put, race, select, take } from 'typed-redux-saga'

import { FavoriteSource, Name } from 'models/Analytics'
import { ErrorLevel } from 'models/ErrorReporting'
import { ID } from 'models/Identifiers'
import { isPremiumContentUSDCPurchaseGated } from 'models/Track'
import { BNUSDC } from 'models/Wallet'
import {
  createFundAccountAndPurchaseTransaction,
  getRecentBlockhash,
  getRootSolanaAccount,
  getTokenAccountInfo,
  purchaseContent
} from 'services/audius-backend/solana'
import { AudiusBackend } from 'services/index'
import { FeatureFlags } from 'services/remote-config/feature-flags'
import { accountSelectors } from 'store/account'
import { getAccountUser } from 'store/account/selectors'
import {
  buyCryptoCanceled,
  buyCryptoFailed,
  buyCryptoSucceeded,
  buyCryptoViaSol
} from 'store/buy-crypto/slice'
import { BuyCryptoError } from 'store/buy-crypto/types'
import {
  buyUSDCFlowFailed,
  buyUSDCFlowSucceeded,
  onrampOpened,
  onrampCanceled
} from 'store/buy-usdc/slice'
import { BuyUSDCError, USDCOnRampProvider } from 'store/buy-usdc/types'
import { getBuyUSDCRemoteConfig, getUSDCUserBank } from 'store/buy-usdc/utils'
import { getTrack } from 'store/cache/tracks/selectors'
import { getUser } from 'store/cache/users/selectors'
import { getContext } from 'store/effects'
import { getPreviewing, getTrackId } from 'store/player/selectors'
import { stop } from 'store/player/slice'
import { saveTrack } from 'store/social/tracks/actions'
import { getFeePayer } from 'store/solana/selectors'
import { OnRampProvider } from 'store/ui/buy-audio/types'
import {
  transactionCanceled,
  transactionFailed,
  transactionSucceeded
} from 'store/ui/coinflow-modal/slice'
import { coinflowOnrampModalActions } from 'store/ui/modals/coinflow-onramp-modal'
import { BN_USDC_CENT_WEI, ceilingBNUSDCToNearestCent } from 'utils/wallet'

import { pollPremiumTrack } from '../premium-content/sagas'
import { updatePremiumTrackStatus } from '../premium-content/slice'

import {
  buyUSDC,
  purchaseCanceled,
  purchaseConfirmed,
  purchaseSucceeded,
  usdcBalanceSufficient,
  purchaseContentFlowFailed,
  startPurchaseContentFlow
} from './slice'
import { ContentType, PurchaseContentError, PurchaseErrorCode } from './types'
import { getBalanceNeeded } from './utils'

const { getUserId } = accountSelectors

const USE_COINFLOW = true

type RaceStatusResult = {
  succeeded?:
    | ReturnType<typeof buyUSDCFlowSucceeded>
    | ReturnType<typeof buyCryptoSucceeded>
  failed?:
    | ReturnType<typeof buyUSDCFlowFailed>
    | ReturnType<typeof buyCryptoFailed>
  canceled?:
    | ReturnType<typeof onrampCanceled>
    | ReturnType<typeof buyCryptoCanceled>
}

type GetPurchaseConfigArgs = {
  contentId: ID
  contentType: ContentType
}

function* getContentInfo({ contentId, contentType }: GetPurchaseConfigArgs) {
  if (contentType !== ContentType.TRACK) {
    throw new Error('Only tracks are supported')
  }

  const trackInfo = yield* select(getTrack, { id: contentId })
  if (
    !trackInfo ||
    !isPremiumContentUSDCPurchaseGated(trackInfo?.premium_conditions)
  ) {
    throw new Error('Content is missing premium conditions')
  }
  const artistInfo = yield* select(getUser, { id: trackInfo.owner_id })
  if (!artistInfo) {
    throw new Error('Failed to retrieve content owner')
  }

  const {
    premium_conditions: {
      usdc_purchase: { price }
    },
    title
  } = trackInfo

  return { price, title, artistInfo }
}

function* getPurchaseConfig({ contentId, contentType }: GetPurchaseConfigArgs) {
  if (contentType !== ContentType.TRACK) {
    throw new Error('Only tracks are supported')
  }

  const trackInfo = yield* select(getTrack, { id: contentId })
  if (
    !trackInfo ||
    !isPremiumContentUSDCPurchaseGated(trackInfo?.premium_conditions)
  ) {
    throw new Error('Content is missing premium conditions')
  }

  const user = yield* select(getUser, { id: trackInfo.owner_id })
  if (!user) {
    throw new Error('Failed to retrieve content owner')
  }
  const recipientERCWallet = user.erc_wallet ?? user.wallet
  if (!recipientERCWallet) {
    throw new Error('Unable to resolve destination wallet')
  }

  const {
    blocknumber,
    premium_conditions: {
      usdc_purchase: { splits }
    }
  } = trackInfo

  return {
    blocknumber,
    splits
  }
}

function* pollForPurchaseConfirmation({
  contentId,
  contentType
}: {
  contentId: ID
  contentType: ContentType
}) {
  if (contentType !== ContentType.TRACK) {
    throw new Error('Only tracks are supported')
  }

  const currentUserId = yield* select(getUserId)
  if (!currentUserId) {
    throw new Error(
      'Failed to fetch current user id while polling for purchase confirmation'
    )
  }
  yield* put(
    updatePremiumTrackStatus({ trackId: contentId, status: 'UNLOCKING' })
  )

  yield* pollPremiumTrack({
    trackId: contentId,
    currentUserId,
    isSourceTrack: true
  })
}

/**
 *
 * 1. Use utils to create versioned transaction for the amount needed
 * 2. Make sure to add memo for the track:id:blocknumber
 * 3. Will want to pass an implementation of sendTransaction as `Wallet`
 * 4. Implement a modal component that can accept the transaction info and pass to coinflow
 * 5. Wire up onSuccess events
 * 6. Look into Marcus' local relay setup against prod for testing. Otherwise, pass a phantom wallet as the feePayer.
 * https://www.notion.so/audiusproject/Pointing-local-Identity-relay-to-stage-Solana-56e0382ed1934e8fad606466b54d5456?pvs=4
 *
 */

function* doStartPurchaseContentFlow({
  payload: {
    extraAmount,
    extraAmountPreset,
    contentId,
    contentType = ContentType.TRACK
  }
}: ReturnType<typeof startPurchaseContentFlow>) {
  const audiusBackendInstance: AudiusBackend = yield* getContext(
    'audiusBackendInstance'
  )
  const getFeatureEnabled = yield* getContext('getFeatureEnabled')
  const isBuyUSDCViaSolEnabled = yield* call(
    getFeatureEnabled,
    FeatureFlags.BUY_USDC_VIA_SOL
  )
  const usdcConfig = yield* call(getBuyUSDCRemoteConfig)
  const reportToSentry = yield* getContext('reportToSentry')
  const { track, make, identify } = yield* getContext('analytics')
  const user = yield* select(getAccountUser)
  if (user) {
    yield* call(identify, user.handle, {
      isBuyUSDCViaSolEnabled
    })
  }

  const { price, title, artistInfo } = yield* call(getContentInfo, {
    contentId,
    contentType
  })

  const analyticsInfo = {
    price: price / 100,
    contentId,
    contentType,
    contentName: title,
    artistHandle: artistInfo.handle,
    isVerifiedArtist: artistInfo.is_verified,
    totalAmount: (price + (extraAmount ?? 0)) / 100,
    payExtraAmount: extraAmount ? extraAmount / 100 : 0,
    payExtraPreset: extraAmountPreset
  }

  // Record start
  yield* call(
    track,
    make({
      eventName: Name.PURCHASE_CONTENT_STARTED,
      ...analyticsInfo
    })
  )

  try {
    // get user bank
    const userBank = yield* call(getUSDCUserBank)

    const tokenAccountInfo = yield* call(
      getTokenAccountInfo,
      audiusBackendInstance,
      {
        mint: 'usdc',
        tokenAccount: userBank
      }
    )
    if (!tokenAccountInfo) {
      throw new Error('Failed to fetch USDC token account info')
    }

    const { amount: initialBalance } = tokenAccountInfo

    const priceBN = new BN(price).mul(BN_USDC_CENT_WEI)
    const extraAmountBN = new BN(extraAmount ?? 0).mul(BN_USDC_CENT_WEI)
    const totalAmountDueCentsBN = priceBN.add(extraAmountBN) as BNUSDC

    const balanceNeeded = getBalanceNeeded(
      totalAmountDueCentsBN,
      new BN(initialBalance.toString()) as BNUSDC,
      usdcConfig.minUSDCPurchaseAmountCents
    )

    // buy USDC if necessary
    if (balanceNeeded.gtn(0)) {
      const balanceNeededCents = ceilingBNUSDCToNearestCent(balanceNeeded)
        .div(BN_USDC_CENT_WEI)
        .toNumber()

      if (USE_COINFLOW) {
        const { blocknumber, splits } = yield* getPurchaseConfig({
          contentId,
          contentType
        })
        const feePayerAddress = yield* select(getFeePayer)
        if (!feePayerAddress) {
          throw new Error('Missing feePayer unexpectedly')
        }
        const feePayer = new PublicKey(feePayerAddress)
        const recentBlockhash = yield* call(
          getRecentBlockhash,
          audiusBackendInstance
        )
        const rootAccount = yield* call(
          getRootSolanaAccount,
          audiusBackendInstance
        )

        const coinflowTransaction = yield* call(
          createFundAccountAndPurchaseTransaction,
          audiusBackendInstance,
          {
            blocknumber,
            recentBlockhash,
            extraAmount,
            splits,
            id: contentId,
            type: 'track',
            wallet: rootAccount,
            feePayer
          }
        )

        const serializedTransaction = coinflowTransaction
          .serialize({ requireAllSignatures: false, verifySignatures: false })
          .toString('base64')
        const amount = balanceNeededCents / 100.0
        yield* put(
          coinflowOnrampModalActions.open({ amount, serializedTransaction })
        )

        const result = yield* race({
          succeeded: take(transactionSucceeded),
          failed: take(transactionFailed),
          canceled: take(transactionCanceled)
        })

        // Return early for failure or cancellation
        if (result.canceled) {
          yield* put(purchaseCanceled())
          return
        }
        if (result.failed) {
          yield* put(
            // TODO: better error
            purchaseContentFlowFailed({
              error: new PurchaseContentError(
                PurchaseErrorCode.Unknown,
                'Coinflow transaction failed'
              )
            })
          )
          return
        }
      } // if (USE_COINFLOW)
      else {
        yield* put(buyUSDC())
        let result: RaceStatusResult | null = null
        if (isBuyUSDCViaSolEnabled) {
          yield* put(
            buyCryptoViaSol({
              // expects "friendly" amount, so dollars
              amount: balanceNeededCents / 100.0,
              mint: 'usdc',
              provider: OnRampProvider.STRIPE
            })
          )
          result = yield* race({
            succeeded: take(buyCryptoSucceeded),
            failed: take(buyCryptoFailed),
            canceled: take(buyCryptoCanceled)
          })
        } else {
          yield* put(
            onrampOpened({
              provider: USDCOnRampProvider.STRIPE,
              purchaseInfo: {
                desiredAmount: balanceNeededCents
              }
            })
          )

          result = yield* race({
            succeeded: take(buyUSDCFlowSucceeded),
            canceled: take(onrampCanceled),
            failed: take(buyUSDCFlowFailed)
          })
        }
        // Return early for failure or cancellation
        if (result.canceled) {
          yield* put(purchaseCanceled())
          return
        }
        if (result.failed) {
          yield* put(
            purchaseContentFlowFailed({ error: result.failed.payload.error })
          )
          return
        }
      }

      yield* put(usdcBalanceSufficient())

      const { blocknumber, splits } = yield* getPurchaseConfig({
        contentId,
        contentType
      })

      // purchase content
      yield* call(purchaseContent, audiusBackendInstance, {
        id: contentId,
        blocknumber,
        extraAmount: extraAmountBN,
        splits,
        type: 'track'
      })
    } // if(balanceNeeded.lte(0))
    else {
      // No need to buy USDC, just execute the purchase
      const { blocknumber, splits } = yield* getPurchaseConfig({
        contentId,
        contentType
      })

      // purchase content
      yield* call(purchaseContent, audiusBackendInstance, {
        id: contentId,
        blocknumber,
        extraAmount: extraAmountBN,
        splits,
        type: 'track'
      })
    }

    yield* put(purchaseSucceeded())

    // confirm purchase
    yield* pollForPurchaseConfirmation({ contentId, contentType })

    // auto-favorite the purchased item
    if (contentType === ContentType.TRACK) {
      yield* put(saveTrack(contentId, FavoriteSource.IMPLICIT))
    }

    // Check if playing the purchased track's preview and if so, stop it
    const isPreviewing = yield* select(getPreviewing)
    const trackId = yield* select(getTrackId)
    if (contentId === trackId && isPreviewing) {
      yield* put(stop({}))
    }

    // finish
    yield* put(purchaseConfirmed({ contentId, contentType }))

    yield* call(
      track,
      make({
        eventName: Name.PURCHASE_CONTENT_SUCCESS,
        ...analyticsInfo
      })
    )
  } catch (e: unknown) {
    // If we get a known error, pipe it through directly. Otherwise make sure we
    // have a properly contstructed error to put into the slice.
    const error =
      e instanceof PurchaseContentError ||
      e instanceof BuyUSDCError ||
      e instanceof BuyCryptoError
        ? e
        : new PurchaseContentError(PurchaseErrorCode.Unknown, `${e}`)
    yield* call(reportToSentry, {
      level: ErrorLevel.Error,
      error,
      additionalInfo: { contentId, contentType }
    })
    yield* put(purchaseContentFlowFailed({ error }))
    yield* call(
      track,
      make({
        eventName: Name.PURCHASE_CONTENT_FAILURE,
        error: error.message,
        ...analyticsInfo
      })
    )
  }
}

function* watchStartPurchaseContentFlow() {
  yield takeLatest(startPurchaseContentFlow, doStartPurchaseContentFlow)
}

export default function sagas() {
  return [watchStartPurchaseContentFlow]
}
