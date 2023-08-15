import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { StakingBridge } from '../target/types/staking_bridge'
import { CHAIN_ID_ETH } from '@certusone/wormhole-sdk'
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount
} from '@solana/spl-token'
import pkg from 'bs58'
import { formatEthAddress, getMinimumAmountOutFromAmountIn, getPostMessageData } from './wormholeTestUtils'
import { ETH_AUDIO_TOKEN_ADDRESS, SOL_AUDIO_DECIMALS, SOL_AUDIO_TOKEN_ADDRESS, SOL_USDC_TOKEN_ADDRESS, ammProgram, bridgeId, serumDexProgram, serumMarketPublicKey, tokenBridgeId } from './constants'
import { getAssociatedPoolKeys, getMarket, getVaultOwnerAndNonce } from './raydiumTestUtils'

const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} = anchor.web3

// Read in fee payer from the environment variable
const FEE_PAYER_SECRET = process.env.feePayerSecret
const feePayerSecret = pkg.decode(FEE_PAYER_SECRET)
const feePayerKeypair = Keypair.fromSecretKey(feePayerSecret)
const feePayerPublicKey = feePayerKeypair.publicKey

const SOL_USDC_TOKEN_ADDRESS_KEY = new PublicKey(SOL_USDC_TOKEN_ADDRESS)
const SOL_AUDIO_TOKEN_ADDRESS_KEY = new PublicKey(SOL_AUDIO_TOKEN_ADDRESS)

const endpoint = 'https://api.mainnet-beta.solana.com'
const connection = new Connection(endpoint, 'confirmed');

async function signTransaction(transaction) {
  transaction.partialSign(feePayerKeypair)
  return transaction
}
async function signAllTransactions(transactions: any[]) {
  transactions.forEach((transaction) => {
    transaction.partialSign(feePayerKeypair)
  })
  return transactions
}

describe('staking-bridge', () => {
  const wallet = {
    publicKey: feePayerPublicKey,
    signTransaction,
    signAllTransactions
  }
  const provider = new anchor.AnchorProvider(connection, wallet, { skipPreflight: true });
  anchor.setProvider(provider)

  const program = anchor.workspace.StakingBridge as Program<StakingBridge>;

  const [stakingBridgePda, stakingBridgePdaBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('staking_bridge')],
    program.programId
  )

  xit('creates the staking bridge pda', async () => {
    // Add your test here.
    const tx = await program.methods
      .createPda()
      .accounts({
        stakingBridgePda,
        payer: feePayerPublicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log('Your transaction signature', tx);
  })

  it('swaps SOL USDC to SOL AUDIO', async () => {
    const market = await getMarket(connection, serumMarketPublicKey.toString(), serumDexProgram.toString())
    console.log("serum market info:", JSON.stringify(market))

    const poolKeys = await getAssociatedPoolKeys({
      programId: ammProgram,
      serumProgramId: serumDexProgram,
      marketId: market.address,
      baseMint: market.baseMint,
      quoteMint: market.quoteMint
    })
    console.log("amm poolKeys: ", JSON.stringify(poolKeys))

    const { vaultOwner, vaultNonce } = await getVaultOwnerAndNonce(serumMarketPublicKey, serumDexProgram)
    if (vaultNonce.toNumber() != market.vaultSignerNonce) {
      console.log("withdraw vaultOwner:", vaultOwner.toString(), "vaultNonce: ", vaultNonce.toNumber(), "market.vaultSignerNonce:", market.vaultSignerNonce.toString())
      throw ("vaultSignerNonce incorrect!")
    }

    // Create associated token accounts for the staking bridge PDA
    const usdcTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      feePayerKeypair,
      SOL_USDC_TOKEN_ADDRESS_KEY,
      stakingBridgePda,
      true // allowOwnerOffCurve: we need this since the owner is a program
    )
    const audioTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      feePayerKeypair,
      SOL_AUDIO_TOKEN_ADDRESS_KEY,
      stakingBridgePda,
      true // allowOwnerOffCurve: we need this since the owner is a program
    )
    console.log({ usdcTokenAccount, audioTokenAccount })

    // Amount of SOL USDC to be swapped for a minimum amount of SOL AUDIO expected to be received from the swap.
    const wholeAmountIn = 0.001
    const { amountIn, minimumAmountOut } = getMinimumAmountOutFromAmountIn(wholeAmountIn);

    const accounts = {
      programId: poolKeys.programId,
      amm: poolKeys.id,
      ammAuthority: poolKeys.authority,
      ammOpenOrders: poolKeys.openOrders,
      ammTargetOrders: poolKeys.targetOrders,
      poolCoinTokenAccount: poolKeys.baseVault,
      poolPcTokenAccount: poolKeys.quoteVault,
      serumProgram: serumDexProgram,
      serumMarket: serumMarketPublicKey,
      serumBids: market.bids,
      serumAsks: market.asks,
      serumEventQueue: market.eventQueue,
      serumCoinVaultAccount: market.baseVault,
      serumPcVaultAccount: market.quoteVault,
      serumVaultSigner: vaultOwner,
      userSourceTokenAccount: usdcTokenAccount.address,
      userDestinationTokenAccount: audioTokenAccount.address,
      userSourceOwner: stakingBridgePda,
      splTokenProgram: TOKEN_PROGRAM_ID,
    }
    console.log({ accounts })

    // Add your test here.
    const tx = await program.methods
      .raydiumSwap(
        amountIn,
        minimumAmountOut,
        vaultNonce,
        stakingBridgePdaBump,
      )
      .accounts(accounts)
      .rpc();
    console.log("Your transaction signature", tx);
  })

  xit('posts the wormhole token bridge transfer message', async () => {
    const messageKeypair = Keypair.generate()
    const messagePublicKey = messageKeypair.publicKey

    // Use your own ETH address to receive the AUDIO tokens
    const recipientEthAddress = '0x9d959Cf57D89DCf41925e19479A04E26f27563dB'
    // How many SOL AUDIO tokens to convert into ETH AUDIO tokens
    const wholeAmount = 1
    const {
      nonce,
      amount,
      fee
    } = getPostMessageData({
      recipientEthAddress,
      wholeAmount,
      solTokenDecimals: SOL_AUDIO_DECIMALS
    })

    const tokenAddress = Buffer.from(formatEthAddress(ETH_AUDIO_TOKEN_ADDRESS))
    const tokenChain = new anchor.BN(CHAIN_ID_ETH)

    // Associated token account owned by the PDA
    const pdaAta = await getOrCreateAssociatedTokenAccount(
      connection,
      feePayerKeypair,
      SOL_AUDIO_TOKEN_ADDRESS_KEY,
      stakingBridgePda,
      true // allowOwnerOffCurve: we need this since the owner is a program
    )
    const pdaAtaKey = pdaAta.address
    console.log({ pdaAtaKey })

    // PDAs
    const [config, configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      tokenBridgeId
    )
    const [wrappedMint, wrappedMintBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('wrapped'),
        tokenChain.toArrayLike(Buffer, 'be', 2),
        tokenAddress
      ],
      tokenBridgeId
    )
    const [wrappedMeta, wrappedMetaBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('meta'),
        wrappedMint.toBuffer()
      ],
      tokenBridgeId
    )
    const [authoritySigner, authoritySignerBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('authority_signer')],
      tokenBridgeId
    )
    const [bridgeConfig, bridgeConfigBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('Bridge')],
      bridgeId
    )
    const [emitter, emitterBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('emitter')],
      tokenBridgeId
    )
    const [sequence, sequenceBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('Sequence'), emitter.toBuffer()],
      bridgeId
    )
    const [feeCollector, feeCollectorBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('fee_collector')],
      bridgeId
    )

    // Bumps array to pass into instruction
    const bumps = [
      configBump,
      wrappedMintBump,
      wrappedMetaBump,
      authoritySignerBump,
      bridgeConfigBump,
      emitterBump,
      sequenceBump,
      feeCollectorBump,
      stakingBridgePdaBump
    ]

    // Accounts
    const accounts = {
      programId: tokenBridgeId,
      bridgeId,
      payer: feePayerPublicKey,
      message: messagePublicKey,
      from: pdaAtaKey,
      fromOwner: stakingBridgePda,

      // bridge PDAs
      config,
      wrappedMint,
      wrappedMeta,
      authoritySigner,
      bridgeConfig,
      emitter,
      sequence,
      feeCollector,

      // system vars
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
      splToken: new PublicKey(TOKEN_PROGRAM_ID),
      systemProgram: SystemProgram.programId,
    }

    // Signers
    // fromOwner is also a signer but the program will use
    // invoke_signed() internally to sign it with the PDA
    const signers = [feePayerKeypair, messageKeypair]

    // Send the transaction
    const tx = await program.methods
      .postWormholeMessage(
        nonce,
        amount,
        fee,
        ...bumps
      )
      .accounts(accounts)
      .signers(signers)
      .rpc();
    console.log('Your transaction signature', tx);
  })
})
