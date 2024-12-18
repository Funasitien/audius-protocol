import { useEffect, useState } from 'react'

import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction
} from '@solana/web3.js'
import { useSelector, useDispatch } from 'react-redux'

import { useAudiusQueryContext } from '~/audius-query'
import { useAppContext } from '~/context'
import { Name } from '~/models/Analytics'
import {
  decorateCoinflowWithdrawalTransaction,
  relayTransaction
} from '~/services/audius-backend'
import {
  BuyUSDCError,
  PurchaseContentError,
  PurchaseErrorCode,
  purchaseContentActions
} from '~/store'
import { getWalletAddresses } from '~/store/account/selectors'
import { getFeePayer } from '~/store/solana/selectors'

type CoinflowAdapter = {
  wallet: {
    publicKey: PublicKey
    sendTransaction: (
      transaction: Transaction | VersionedTransaction
    ) => Promise<string>
  }
  connection: Connection
}

/** An adapter for signing and sending Coinflow withdrawal transactions. It will decorate
 * the incoming transaction to route it through a user bank. The transcation will then be
 * signed with the current user's Solana root wallet and sent/confirmed via Relay.
 */
export const useCoinflowWithdrawalAdapter = () => {
  const {
    audiusBackend,
    analytics: { make, track }
  } = useAppContext()
  const [adapter, setAdapter] = useState<CoinflowAdapter | null>(null)
  const feePayerOverride = useSelector(getFeePayer)
  const { currentUser } = useSelector(getWalletAddresses)
  const { audiusSdk, solanaWalletService } = useAudiusQueryContext()

  useEffect(() => {
    const initWallet = async () => {
      const wallet = await solanaWalletService.getKeypair()
      const sdk = await audiusSdk()
      const connection = sdk.services.solanaClient.connection

      if (!wallet) {
        console.error(
          'useCoinflowWithdrawalAdapter: Missing solana root wallet'
        )
        return
      }

      setAdapter({
        connection,
        wallet: {
          publicKey: wallet.publicKey,
          sendTransaction: async (
            transaction: Transaction | VersionedTransaction
          ) => {
            if (!feePayerOverride) {
              throw new Error('Missing fee payer override')
            }
            if (transaction instanceof VersionedTransaction) {
              throw new Error(
                'VersionedTransaction not supported in withdrawal adapter'
              )
            }
            if (!currentUser) {
              throw new Error('Missing current user')
            }
            const feePayer = new PublicKey(feePayerOverride)
            const finalTransaction =
              await decorateCoinflowWithdrawalTransaction(sdk, audiusBackend, {
                ethAddress: currentUser,
                transaction,
                feePayer,
                wallet
              })
            finalTransaction.partialSign(wallet)
            const { res, error, errorCode } = await relayTransaction(
              audiusBackend,
              {
                transaction: finalTransaction,
                skipPreflight: true
              }
            )
            if (!res) {
              console.error('Relaying Coinflow transaction failed.', {
                error,
                errorCode,
                finalTransaction
              })
              track(
                make({
                  eventName:
                    Name.WITHDRAW_USDC_COINFLOW_SEND_TRANSACTION_FAILED,
                  error: error ?? undefined,
                  errorCode: errorCode ?? undefined
                })
              )
              throw new Error(
                `Relaying Coinflow transaction failed: ${
                  error ?? 'Unknown error'
                }`
              )
            }
            track(
              make({
                eventName: Name.WITHDRAW_USDC_COINFLOW_SEND_TRANSACTION,
                signature: res
              })
            )
            return res
          }
        }
      })
    }
    initWallet()
  }, [
    audiusBackend,
    feePayerOverride,
    currentUser,
    solanaWalletService,
    make,
    track,
    audiusSdk
  ])

  return adapter
}

/** An adapter for signing and sending unmodified Coinflow transactions. Will partialSign with the
 * current user's Solana root wallet and send/confirm locally (no relay).
 * @param onSuccess optional callback to invoke when the relay succeeds
 */
export const useCoinflowAdapter = ({
  onSuccess,
  onFailure
}: {
  onSuccess: () => void
  onFailure: () => void
}) => {
  const { audiusBackend } = useAppContext()
  const [adapter, setAdapter] = useState<CoinflowAdapter | null>(null)
  const { audiusSdk, solanaWalletService } = useAudiusQueryContext()
  const dispatch = useDispatch()

  useEffect(() => {
    const initWallet = async () => {
      const wallet = await solanaWalletService.getKeypair()
      const sdk = await audiusSdk()
      const connection = sdk.services.solanaClient.connection
      if (!wallet) {
        console.error(
          'useCoinflowWithdrawalAdapter: Missing solana root wallet'
        )
        return
      }

      setAdapter({
        connection,
        wallet: {
          publicKey: wallet.publicKey,
          sendTransaction: async (tx: Transaction | VersionedTransaction) => {
            try {
              const transaction = tx as VersionedTransaction

              // Get a more recent blockhash to prevent BlockhashNotFound errors
              transaction.message.recentBlockhash = (
                await connection.getLatestBlockhash()
              ).blockhash

              // Use our own fee payer as signer
              transaction.message.staticAccountKeys[0] =
                await sdk.services.solanaRelay.getFeePayer()
              transaction.signatures[0] = Buffer.alloc(64, 0)

              // Sign with user's Eth wallet derived "root" Solana wallet,
              // which is the source of the funds for the purchase
              transaction.sign([wallet])

              // Send to relay to make use of retry and caching logic
              const { signature } = await sdk.services.solanaRelay.relay({
                transaction,
                sendOptions: {
                  skipPreflight: true
                }
              })
              onSuccess()
              return signature
            } catch (e) {
              console.error('Caught error in sendTransaction', e)
              const error =
                e instanceof PurchaseContentError || e instanceof BuyUSDCError
                  ? e
                  : new PurchaseContentError(PurchaseErrorCode.Unknown, `${e}`)
              dispatch(
                purchaseContentActions.purchaseContentFlowFailed({ error })
              )
              onFailure()
              throw e
            }
          }
        }
      })
    }
    initWallet()
  }, [
    audiusBackend,
    solanaWalletService,
    audiusSdk,
    dispatch,
    onSuccess,
    onFailure
  ])

  return adapter
}
