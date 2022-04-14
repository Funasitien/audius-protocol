const config = require('./config')
const solanaWeb3 = require('@solana/web3.js')
const keccak256 = require('keccak256')
const secp256k1 = require('secp256k1')
const borsh = require('borsh')

const VALID_SIGNER = config.get('solanaValidSigner')
const AUDIUS_ETH_REGISTRY_PROGRAM = config.get('solanaAudiusEthRegistryAddress') ? new solanaWeb3.PublicKey(
  config.get('solanaAudiusEthRegistryAddress')
) : null
const TRACK_LISTEN_PROGRAM = config.get('solanaTrackListenCountAddress') ? new solanaWeb3.PublicKey(
  config.get('solanaTrackListenCountAddress')
) : null
const INSTRUCTIONS_PROGRAM = new solanaWeb3.PublicKey(
  'Sysvar1nstructions1111111111111111111111111'
)
const CLOCK_PROGRAM = new solanaWeb3.PublicKey(
  'SysvarC1ock11111111111111111111111111111111'
)

class TrackData {
  constructor ({ userId, trackId, source, timestamp }) {
    this.userId = userId
    this.trackId = trackId
    this.source = source
    this.timestamp = timestamp
  }
}

class InstructionArgs {
  constructor ({ trackData, signature, recoveryId }) {
    this.trackData = trackData
    this.signature = signature
    this.recoveryId = recoveryId
  }
}

class InstructionEnum {
  constructor ({ instruction, choose }) {
    this.instruction = instruction
    this.choose = choose
  }
}

const trackDataSchema = new Map([
  [
    TrackData,
    {
      kind: 'struct',
      fields: [
        ['userId', 'string'],
        ['trackId', 'string'],
        ['source', 'string'],
        ['timestamp', 'u64']
      ]
    }
  ]
])

const instructionSchema = new Map([
  [
    InstructionEnum,
    {
      kind: 'enum',
      field: 'choose',
      values: [['instruction', InstructionArgs]]
    }
  ],
  [
    InstructionArgs,
    {
      kind: 'struct',
      fields: [
        ['trackData', TrackData],
        ['signature', [64]],
        ['recoveryId', 'u8']
      ]
    }
  ],
  [
    TrackData,
    {
      kind: 'struct',
      fields: [
        ['userId', 'string'],
        ['trackId', 'string'],
        ['source', 'string'],
        ['timestamp', 'u64']
      ]
    }
  ]
])

let feePayerKeypair = null
let feePayerKeypairs = null

// Optionally returns the existing singleFeePayer
// Ensures other usages of this function do not break as we upgrade to multiple
function getFeePayerKeypair (singleFeePayer = true) {
  if (!feePayerKeypairs) {
    feePayerKeypairs = config.get('solanaFeePayerWallets')
      ? config.get('solanaFeePayerWallets')
        .map(item => item.privateKey)
        .map(key => solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(key)))
      : null
  }
  if (!feePayerKeypair) {
    feePayerKeypair = (feePayerKeypairs && feePayerKeypairs[0]) || null
  }
  // Ensure legacy usage of single feePayer is not broken
  // If multiple feepayers are not provided, default to single value as well
  if (singleFeePayer || feePayerKeypairs === null || feePayerKeypairs.length === 0) {
    return feePayerKeypair
  }

  const randomFeePayerIndex = Math.floor(Math.random() * feePayerKeypairs.length)
  return feePayerKeypairs[randomFeePayerIndex]
}

async function createTrackListenTransaction ({
  validSigner,
  privateKey,
  userId,
  trackId,
  source,
  connection
}) {
  validSigner = validSigner || VALID_SIGNER

  let privKey = Buffer.from(privateKey, 'hex')
  let pubKey = secp256k1.publicKeyCreate(privKey, false).slice(1)

  let validSignerPubK = new solanaWeb3.PublicKey(validSigner)
  let accInfo = await connection.getAccountInfo(validSignerPubK)
  let signerGroup = new solanaWeb3.PublicKey(
    accInfo.data.toJSON().data.slice(1, 33)
  ) // cut off version and eth address from valid signer data

  let trackData = new TrackData({
    userId: userId,
    trackId: trackId,
    source: source,
    timestamp: Math.round(new Date().getTime() / 1000)
  })

  const serializedTrackData = borsh.serialize(trackDataSchema, trackData)
  let msgHash = keccak256(serializedTrackData.toJSON().data)

  const sigObj = secp256k1.ecdsaSign(Uint8Array.from(msgHash), privKey)

  let instructionArgs = new InstructionArgs({
    trackData: trackData,
    signature: Array.from(sigObj.signature),
    recoveryId: sigObj.recid
  })

  let instructionData = new InstructionEnum({
    instruction: instructionArgs,
    choose: 'instruction'
  })

  const serializedInstructionArgs = borsh.serialize(
    instructionSchema,
    instructionData
  )

  let transaction = new solanaWeb3.Transaction()

  let secpInstruction = solanaWeb3.Secp256k1Program.createInstructionWithPublicKey(
    {
      publicKey: pubKey,
      message: serializedTrackData.toJSON().data,
      signature: sigObj.signature,
      recoveryId: sigObj.recid
    }
  )

  transaction.add(secpInstruction)

  transaction.add({
    keys: [
      { pubkey: validSignerPubK, isSigner: false, isWritable: false },
      { pubkey: signerGroup, isSigner: false, isWritable: false },
      { pubkey: AUDIUS_ETH_REGISTRY_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: INSTRUCTIONS_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: CLOCK_PROGRAM, isSigner: false, isWritable: false }
    ],
    programId: TRACK_LISTEN_PROGRAM,
    data: serializedInstructionArgs
  })

  return transaction
}

const getUnixTs = () => {
  return new Date().getTime() / 1000
}

async function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Adapted from mango send function
// https://github.com/blockworks-foundation/mango-ui/blob/b6abfc6c13b71fc17ebbe766f50b8215fa1ec54f/src/utils/send.tsx#L785
// THIS FUNCTION MUST BE MOVED TO LIBS TRANSACTIONHANDLER
async function sendAndSignTransaction (connection, transaction, signers, timeout, logger) {
  // Sign transaction
  const latestBlockhashInfo = await connection.getLatestBlockhash('confirmed')
  const latestBlockhash = latestBlockhashInfo.blockhash
  // Manually increment the last valid block height
  const lastValidBlockHeight = latestBlockhashInfo.lastValidBlockHeight + 151
  console.log(`TrackListen ${JSON.stringify(latestBlockhashInfo)}, ${lastValidBlockHeight}`)
  transaction.recentBlockhash = latestBlockhash
  transaction.sign(signers)
  // Serialize and grab raw transaction bytes
  let rawTransaction = transaction.serialize()
  const startTime = getUnixTs()
  const txid = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
      maxRetries: 0
    }
  )

  let done = false;
  // Anonymous function to retry sending until confirmation
  (async () => {
    const elapsed = getUnixTs() - startTime
    // eslint-disable-next-line no-unmodified-loop-condition
    while (!done && elapsed < timeout) {
      connection.sendRawTransaction(rawTransaction, { skipPreflight: true, maxRetries: 0 })
      await delay(300)
    }
    logger.info(`TrackListen | Exited retry send loop for ${txid}, elapsed=${elapsed}, done=${done}, timeout=${timeout}, startTime=${startTime}`)
  })()

  try {
    await awaitTransactionSignatureConfirmation(txid, timeout, connection, lastValidBlockHeight, logger)
  } catch (e) {
    throw new Error(e)
  } finally {
    done = true
  }
  return txid
}

// Adapted from mango send function
// https://github.com/blockworks-foundation/mango-ui/blob/b6abfc6c13b71fc17ebbe766f50b8215fa1ec54f/src/utils/send.tsx#L785
// THIS FUNCTION MUST BE MOVED TO LIBS TRANSACTIONHANDLER
async function awaitTransactionSignatureConfirmation (
  txid,
  timeout,
  connection,
  expirySlot,
  logger
) {
  let done = false
  const result = await new Promise((resolve, reject) => {
    (async () => {
      setTimeout(() => {
        if (done) {
          return
        }
        done = true
        reject(new Error(`Timed out for txid ${txid}`))
      }, timeout)
      try {
        connection.onSignature(
          txid,
          (result) => {
            done = true
            if (result.err) {
              reject(result.err)
            } else {
              resolve(result)
            }
          },
          connection.commitment
        )
      } catch (e) {
        done = true
        logger.error('TrackListen | WS error in setup', txid, e)
      }
      while (!done) {
        // eslint-disable-next-line no-loop-func
        (async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              txid
            ])
            const contextSlot = signatureStatuses.context.slot
            const expiredSlot = contextSlot > expirySlot
            // Exit early if slot has expired
            if (expiredSlot) {
              done = true
              reject(new Error(`Failed slot timeout`))
            }
            const result = signatureStatuses && signatureStatuses.value[0]
            if (!done) {
              if (!result) {
              } else if (result.err) {
                logger.error('TrackListen | REST error for', txid, result)
                done = true
                reject(result.err)
              } else if (!(result.confirmations || result.confirmationStatus === 'confirmed' || result.confirmationStatus === 'finalized')) {
              } else {
                done = true
                resolve(result)
              }
            }
          } catch (e) {
            if (!done) {
              logger.error('REST connection error: txid', txid, e)
            }
          }
        })()
        await delay(300)
      }
    })()
  })
  done = true
  return result
}

exports.createTrackListenTransaction = createTrackListenTransaction
exports.getFeePayerKeypair = getFeePayerKeypair
exports.sendAndSignTransaction = sendAndSignTransaction
