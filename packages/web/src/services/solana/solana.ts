import { SolanaWalletAddress, MintName, DEFAULT_MINT } from '@audius/common'
import {
  Account,
  getMinimumBalanceForRentExemptAccount,
  getAssociatedTokenAddressSync
} from '@solana/spl-token'
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair,
  VersionedTransaction,
  AddressLookupTableAccount,
  TransactionMessage
} from '@solana/web3.js'

import { getLibs } from 'services/audius-libs'

export const ROOT_ACCOUNT_SIZE = 0 // Root account takes 0 bytes, but still pays rent!
export const TRANSACTION_FEE_FALLBACK = 5000

/**
 * Gets the solana connection from libs.
 */
export const getSolanaConnection = async () => {
  const libs = await getLibs()
  return libs.solanaWeb3Manager!.connection
}

/**
 * Checks if the given address is a solana address vs an associated token account.
 */
export const isSolWallet = async (destinationWallet: SolanaWalletAddress) => {
  try {
    const destination = new PublicKey(destinationWallet)
    return PublicKey.isOnCurve(destination.toBytes())
  } catch (err) {
    console.error(err)
    return false
  }
}

/**
 * Checks if the given account address is an associated token account
 */
export const isTokenAccount = async ({
  accountAddress,
  mint
}: {
  accountAddress: SolanaWalletAddress
  mint: MintName
}) => {
  const info = await getTokenAccountInfo({
    tokenAccount: new PublicKey(accountAddress),
    mint
  })
  return info !== null
}

/**
 * Gets the current user's root solana account.
 */
export const getRootSolanaAccount = async () => {
  const libs = await getLibs()
  return Keypair.fromSeed(libs.Account!.hedgehog.wallet!.getPrivateKey())
}

/**
 * Checks whether the input address is a valid solana address.
 */
export const isValidSolAddress = async (address: SolanaWalletAddress) => {
  try {
    // @ts-ignore - need an unused variable to check if the destinationWallet is valid
    const ignored = new PublicKey(address)
    return true
  } catch (err) {
    console.debug(err)
    return false
  }
}

/**
 * Calculates the minimum amount of rent needed for a solana account to be
 * rent-exempt.
 */
export const getRootAccountRentExemptionMinimum = async () => {
  const connection = await getSolanaConnection()
  return await connection.getMinimumBalanceForRentExemption(
    ROOT_ACCOUNT_SIZE,
    'processed'
  )
}

/**
 * Gets the token account info for a given token account.
 */
export const getTokenAccountInfo = async ({
  tokenAccount,
  mint = DEFAULT_MINT
}: {
  tokenAccount: PublicKey
  mint?: MintName
}): Promise<Account | null> => {
  const libs = await getLibs()
  return await libs.solanaWeb3Manager!.getTokenAccountInfo(
    tokenAccount.toString()
  )
}

/**
 * Gets the recent blockhash.
 */
export const getRecentBlockhash = async () => {
  const connection = await getSolanaConnection()
  return (await connection.getLatestBlockhash()).blockhash
}

/**
 * Gets the fee for a transfer transaction.
 */
export const getTransferTransactionFee = async (
  destinationPubkey: PublicKey
) => {
  const connection = await getSolanaConnection()
  const recentBlockhash = await getRecentBlockhash()
  const tx = new Transaction()
  tx.recentBlockhash = recentBlockhash
  tx.feePayer = destinationPubkey
  return (await tx.getEstimatedFee(connection)) ?? TRANSACTION_FEE_FALLBACK
}

/**
 * Calculates the rent for an associated token account.
 */
export const getAssociatedTokenAccountRent = async () => {
  const connection = await getSolanaConnection()
  return await getMinimumBalanceForRentExemptAccount(connection)
}

/**
 * Returns the associated USDC token account for the given solana account.
 */
export const getUSDCAssociatedTokenAccount = async (
  solanaRootAccountPubkey: PublicKey
) => {
  const libs = await getLibs()
  return getAssociatedTokenAddressSync(
    libs.solanaWeb3Manager!.mints.usdc,
    solanaRootAccountPubkey
  )
}

/**
 * Signs a set of instructions with the supplied signer and fee payer.
 */
export const getSignatureForTransaction = async ({
  instructions,
  signer,
  feePayer,
  recentBlockhash
}: {
  instructions: TransactionInstruction[]
  signer: Keypair
  feePayer: PublicKey
  recentBlockhash: string
}) => {
  const transaction = new Transaction()
  transaction.recentBlockhash = recentBlockhash
  transaction.add(...instructions)
  transaction.feePayer = feePayer
  transaction.partialSign(signer)
  return transaction.signatures.filter((s) => s.signature !== null)
}

export const getSignatureForV0Transaction = async ({
  instructions,
  signer,
  feePayer,
  recentBlockhash,
  lookupTableAddresses
}: {
  instructions: TransactionInstruction[]
  signer: Keypair
  feePayer: PublicKey
  recentBlockhash: string
  lookupTableAddresses: string[]
}) => {
  const connection = await getSolanaConnection()
  const lookupTableAccounts: AddressLookupTableAccount[] = []
  lookupTableAddresses.forEach(async (address) => {
    const lookupTableAccount = await connection.getAddressLookupTable(
      new PublicKey(address)
    )
    if (lookupTableAccount.value !== null)
      lookupTableAccounts.push(lookupTableAccount.value)
  })
  const message = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash,
    instructions
  }).compileToV0Message(lookupTableAccounts)
  const transaction = new VersionedTransaction(message)
  transaction.sign([signer])
  const ret = transaction.signatures
    .filter((s) => !s.every((i) => i === 0)) // Filter sigs that are all 0s
    .map((s) => {
      // Map to the format expected by relay
      return {
        publicKey: feePayer.toString(),
        signature: Buffer.from(s)
      }
    })
  console.debug('REED sigs ret:', ret)
  return ret
}
