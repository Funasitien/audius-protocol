import { User } from '@sentry/browser'
import {
  call,
  fork,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLatest,
  delay
} from 'redux-saga/effects'

import {
  ChallengeRewardID,
  FailureReason,
  UserChallenge
} from 'common/models/AudioRewards'
import { StringAudio } from 'common/models/Wallet'
import { IntKeys, StringKeys } from 'common/services/remote-config'
import { fetchAccountSucceeded } from 'common/store/account/reducer'
import { getAccountUser, getUserId } from 'common/store/account/selectors'
import {
  getClaimStatus,
  getClaimToRetry,
  getUserChallenge,
  getUserChallenges,
  getUserChallengesOverrides
} from 'common/store/pages/audio-rewards/selectors'
import {
  Claim,
  resetAndCancelClaimReward,
  claimChallengeReward,
  claimChallengeRewardFailed,
  claimChallengeRewardSucceeded,
  claimChallengeRewardWaitForRetry,
  ClaimStatus,
  CognitoFlowStatus,
  fetchUserChallenges,
  fetchUserChallengesFailed,
  fetchUserChallengesSucceeded,
  HCaptchaStatus,
  setCognitoFlowStatus,
  setHCaptchaStatus,
  setUserChallengesDisbursed,
  updateHCaptchaScore,
  showRewardClaimedToast,
  claimChallengeRewardAlreadyClaimed,
  setUserChallengeCurrentStepCount,
  resetUserChallengeCurrentStepCount,
  updateOptimisticListenStreak,
  setUndisbursedChallenges,
  UndisbursedUserChallenge
} from 'common/store/pages/audio-rewards/slice'
import { setVisibility } from 'common/store/ui/modals/slice'
import { getBalance, increaseBalance } from 'common/store/wallet/slice'
import { stringAudioToStringWei } from 'common/utils/wallet'
import { show as showMusicConfetti } from 'components/music-confetti/store/slice'
import mobileSagas from 'pages/audio-rewards-page/store/mobileSagas'
import AudiusBackend from 'services/AudiusBackend'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { waitForBackendSetup } from 'store/backend/sagas'
import { AUDIO_PAGE } from 'utils/route'
import { encodeHashId } from 'utils/route/hashIds'
import { waitForValue } from 'utils/sagaHelpers'
import {
  foregroundPollingDaemon,
  visibilityPollingDaemon
} from 'utils/sagaPollingDaemons'

const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT
const REACT_APP_ORACLE_ETH_ADDRESSES =
  process.env.REACT_APP_ORACLE_ETH_ADDRESSES
const REACT_APP_AAO_ENDPOINT = process.env.REACT_APP_AAO_ENDPOINT
const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE
const HCAPTCHA_MODAL_NAME = 'HCaptcha'
const COGNITO_MODAL_NAME = 'Cognito'
const CHALLENGE_REWARDS_MODAL_NAME = 'ChallengeRewardsExplainer'

function getOracleConfig() {
  let oracleEthAddress = remoteConfigInstance.getRemoteVar(
    StringKeys.ORACLE_ETH_ADDRESS
  )
  let AAOEndpoint = remoteConfigInstance.getRemoteVar(
    StringKeys.ORACLE_ENDPOINT
  )
  if (ENVIRONMENT === 'development') {
    const oracleEthAddresses = (REACT_APP_ORACLE_ETH_ADDRESSES || '').split(',')
    if (oracleEthAddresses.length > 0) {
      oracleEthAddress = oracleEthAddresses[0]
    }
    if (REACT_APP_AAO_ENDPOINT) {
      AAOEndpoint = REACT_APP_AAO_ENDPOINT
    }
  }

  return { oracleEthAddress, AAOEndpoint }
}

function* retryClaimChallengeReward(errorResolved: boolean) {
  const claimStatus: ClaimStatus = yield select(getClaimStatus)
  const claim: Claim = yield select(getClaimToRetry)
  if (claimStatus === ClaimStatus.WAITING_FOR_RETRY) {
    // Restore the challenge rewards modal if necessary
    yield put(
      setVisibility({ modal: CHALLENGE_REWARDS_MODAL_NAME, visible: true })
    )
    if (errorResolved) {
      yield put(claimChallengeReward({ claim, retryOnFailure: false }))
    } else {
      yield put(claimChallengeRewardFailed())
    }
  }
}

// Returns the number of ms to wait before next retry using exponential backoff
// ie. 400 ms, 800 ms, 1.6 sec, 3.2 sec, 6.4 sec
export const getBackoff = (retryCount: number) => {
  return 200 * 2 ** (retryCount + 1)
}

const getClaimingConfig = () => {
  const quorumSize = remoteConfigInstance.getRemoteVar(
    IntKeys.ATTESTATION_QUORUM_SIZE
  )
  const maxClaimRetries = remoteConfigInstance.getRemoteVar(
    IntKeys.MAX_CLAIM_RETRIES
  )
  const rewardsAttestationEndpoints = remoteConfigInstance.getRemoteVar(
    StringKeys.REWARDS_ATTESTATION_ENDPOINTS
  )
  const parallelization = remoteConfigInstance.getRemoteVar(
    IntKeys.CLIENT_ATTESTATION_PARALLELIZATION
  )
  const { oracleEthAddress, AAOEndpoint } = getOracleConfig()

  return {
    quorumSize,
    maxClaimRetries,
    oracleEthAddress,
    AAOEndpoint,
    rewardsAttestationEndpoints,
    parallelization
  }
}

function* claimChallengeRewardAsync(
  action: ReturnType<typeof claimChallengeReward>
) {
  const { claim, retryOnFailure, retryCount = 0 } = action.payload
  const { specifiers, challengeId, amount } = claim

  // Do not proceed to claim if challenge is not complete from a DN perspective.
  // This is possible because the client may optimistically set a challenge as complete
  // even though the DN has not yet indexed the change that would mark the challenge as complete.
  // In this case, we wait until the challenge is complete in the DN before claiming
  yield race({
    isComplete: call(
      waitForValue,
      getUserChallenge,
      { challengeId },
      (challenge: UserChallenge) => challenge.is_complete
    ),
    poll: call(pollUserChallenges),
    timeout: delay(3000)
  })

  const {
    quorumSize,
    maxClaimRetries,
    oracleEthAddress,
    AAOEndpoint,
    rewardsAttestationEndpoints,
    parallelization
  } = getClaimingConfig()

  const currentUser: User = yield select(getAccountUser)

  // When endpoints is unset, `submitAndEvaluateAttestations` picks for us
  const endpoints = rewardsAttestationEndpoints?.split(',') || null
  const hasConfig =
    oracleEthAddress &&
    AAOEndpoint &&
    quorumSize &&
    quorumSize > 0 &&
    maxClaimRetries &&
    !isNaN(maxClaimRetries)

  if (!hasConfig) {
    console.error('Error claiming rewards: Config is missing')
    return
  }
  try {
    const challenges = specifiers.map(specifier => ({
      challenge_id: challengeId,
      specifier
    }))
    const response: { error?: string } = yield call(
      AudiusBackend.submitAndEvaluateAttestations,
      {
        challenges,
        encodedUserId: encodeHashId(currentUser.user_id),
        handle: currentUser.handle,
        recipientEthAddress: currentUser.wallet,
        oracleEthAddress,
        amount,
        quorumSize,
        endpoints,
        AAOEndpoint,
        parallelization
      }
    )
    if (response.error) {
      if (retryOnFailure && retryCount < maxClaimRetries!) {
        switch (response.error) {
          case FailureReason.HCAPTCHA:
            // Hide the Challenge Rewards Modal because the HCaptcha modal doesn't look good on top of it.
            // Will be restored on close of the HCaptcha modal.
            yield put(
              setVisibility({
                modal: CHALLENGE_REWARDS_MODAL_NAME,
                visible: false
              })
            )
            yield put(
              setVisibility({ modal: HCAPTCHA_MODAL_NAME, visible: true })
            )
            yield put(claimChallengeRewardWaitForRetry(claim))
            break
          case FailureReason.COGNITO_FLOW:
            yield put(
              setVisibility({ modal: COGNITO_MODAL_NAME, visible: true })
            )
            yield put(claimChallengeRewardWaitForRetry(claim))
            break

          case FailureReason.ALREADY_DISBURSED:
          case FailureReason.ALREADY_SENT:
            yield put(claimChallengeRewardAlreadyClaimed())
            break
          case FailureReason.BLOCKED:
            throw new Error('User is blocked from claiming')
          // For these 'attestation aggregation errors',
          // we've already retried in libs so unlikely to succeed here.
          case FailureReason.MISSING_CHALLENGES:
          case FailureReason.CHALLENGE_INCOMPLETE:
            yield put(claimChallengeRewardFailed())
            break
          case FailureReason.UNKNOWN_ERROR:
          default:
            // If this was an aggregate challenges with multiple specifiers,
            // then libs handles the retries and we shouldn't retry here.
            if (specifiers.length > 1) {
              yield put(claimChallengeRewardFailed())
              break
            }
            yield delay(getBackoff(retryCount))
            yield put(
              claimChallengeReward({
                claim,
                retryOnFailure: true,
                retryCount: retryCount + 1
              })
            )
        }
      } else {
        yield put(claimChallengeRewardFailed())
      }
    } else {
      yield put(
        increaseBalance({
          amount: stringAudioToStringWei(amount.toString() as StringAudio)
        })
      )
      yield put(setUserChallengesDisbursed({ challengeId, specifiers }))
      yield put(claimChallengeRewardSucceeded())
    }
  } catch (e) {
    console.error('Error claiming rewards:', e)
    yield put(claimChallengeRewardFailed())
  }
}

function* watchSetHCaptchaStatus() {
  yield takeLatest(setHCaptchaStatus.type, function* (
    action: ReturnType<typeof setHCaptchaStatus>
  ) {
    const { status } = action.payload
    yield call(retryClaimChallengeReward, status === HCaptchaStatus.SUCCESS)
  })
}

function* watchSetCognitoFlowStatus() {
  yield takeLatest(setCognitoFlowStatus.type, function* (
    action: ReturnType<typeof setCognitoFlowStatus>
  ) {
    const { status } = action.payload
    // Only attempt retry on closed, so that we don't error on open
    if (status === CognitoFlowStatus.CLOSED) {
      yield call(retryClaimChallengeReward, true)
    }
  })
}

function* watchClaimChallengeReward() {
  yield takeLatest(claimChallengeReward.type, function* (
    args: ReturnType<typeof claimChallengeReward>
  ) {
    // Race the claim against the user clicking "close" on the modal,
    // so that the claim saga gets canceled if the modal is closed
    yield race({
      task: call(claimChallengeRewardAsync, args),
      cancel: take(resetAndCancelClaimReward.type)
    })
  })
}

function* fetchUserChallengesAsync() {
  yield call(waitForBackendSetup)
  const currentUserId: number = yield select(getUserId)

  try {
    const userChallenges: UserChallenge[] = yield call(
      apiClient.getUserChallenges,
      {
        userID: currentUserId
      }
    )
    const undisbursedChallenges: UndisbursedUserChallenge[] = yield call(
      [apiClient, apiClient.getUndisbursedUserChallenges],
      { userID: currentUserId }
    )
    yield put(fetchUserChallengesSucceeded({ userChallenges }))
    yield put(setUndisbursedChallenges(undisbursedChallenges ?? []))
  } catch (e) {
    console.error(e)
    yield put(fetchUserChallengesFailed())
  }
}

function* checkForNewDisbursements(
  action: ReturnType<typeof fetchUserChallengesSucceeded>
) {
  const { userChallenges } = action.payload
  if (!userChallenges) {
    return
  }
  const prevChallenges: Partial<Record<
    ChallengeRewardID,
    UserChallenge
  >> = yield select(getUserChallenges)
  const challengesOverrides: Partial<Record<
    ChallengeRewardID,
    UserChallenge
  >> = yield select(getUserChallengesOverrides)
  let newDisbursement = false
  for (const challenge of userChallenges) {
    const prevChallenge = prevChallenges[challenge.challenge_id]
    const challengeOverrides = challengesOverrides[challenge.challenge_id]
    // Check for new disbursements
    if (
      challenge.is_disbursed &&
      prevChallenge &&
      !prevChallenge.is_disbursed && // it wasn't already claimed
      (!challengeOverrides || !challengeOverrides.is_disbursed) // we didn't claim this session
    ) {
      newDisbursement = true
    }
  }
  if (newDisbursement) {
    yield put(getBalance())
    yield put(showMusicConfetti())
    yield put(showRewardClaimedToast())
  }
}

function* watchFetchUserChallengesSucceeded() {
  yield takeEvery(fetchUserChallengesSucceeded.type, function* (
    action: ReturnType<typeof fetchUserChallengesSucceeded>
  ) {
    yield call(checkForNewDisbursements, action)
    yield call(handleOptimisticChallengesOnUpdate, action)
  })
}

function* watchFetchUserChallenges() {
  yield takeEvery(fetchUserChallenges.type, function* () {
    yield call(fetchUserChallengesAsync)
  })
}

/**
 * Resets the listen streak override if current_step_count is fetched and non-zero
 * This handles the case where discovery can reset the user's listen streak
 */
function* handleOptimisticListenStreakUpdate(
  challenge: UserChallenge,
  challengeOverrides?: UserChallenge
) {
  if (
    (challengeOverrides?.current_step_count ?? 0) > 0 &&
    challenge.current_step_count !== 0
  ) {
    yield put(
      resetUserChallengeCurrentStepCount({
        challengeId: challenge.challenge_id
      })
    )
  }
}

/**
 * Handles challenge override updates on user challenge updates
 */
function* handleOptimisticChallengesOnUpdate(
  action: ReturnType<typeof fetchUserChallengesSucceeded>
) {
  const { userChallenges } = action.payload
  if (!userChallenges) {
    return
  }

  const challengesOverrides: Partial<Record<
    ChallengeRewardID,
    UserChallenge
  >> = yield select(getUserChallengesOverrides)

  for (const challenge of userChallenges) {
    if (challenge.challenge_id === 'listen-streak') {
      yield call(
        handleOptimisticListenStreakUpdate,
        challenge,
        challengesOverrides[challenge.challenge_id]
      )
    }
  }
}

/**
 * Updates the listen streak optimistically if current_step_count is zero and a track is played
 */
function* watchUpdateOptimisticListenStreak() {
  yield takeEvery(updateOptimisticListenStreak.type, function* () {
    const listenStreakChallenge: ReturnType<typeof getUserChallenge> = yield select(
      getUserChallenge,
      {
        challengeId: 'listen-streak'
      }
    )
    if (listenStreakChallenge?.current_step_count === 0) {
      yield put(
        setUserChallengeCurrentStepCount({
          challengeId: 'listen-streak',
          stepCount: 1
        })
      )
    }
  })
}

function* watchUpdateHCaptchaScore() {
  yield takeEvery(updateHCaptchaScore.type, function* (
    action: ReturnType<typeof updateHCaptchaScore>
  ): any {
    const { token } = action.payload
    const result = yield call(AudiusBackend.updateHCaptchaScore, token)
    if (result.error) {
      yield put(setHCaptchaStatus({ status: HCaptchaStatus.ERROR }))
    } else {
      yield put(setHCaptchaStatus({ status: HCaptchaStatus.SUCCESS }))
    }
  })
}

function* pollUserChallenges() {
  while (true) {
    yield put(fetchUserChallenges())
    yield delay(500)
  }
}

function* userChallengePollingDaemon() {
  yield call(remoteConfigInstance.waitForRemoteConfig)
  const defaultChallengePollingTimeout = remoteConfigInstance.getRemoteVar(
    IntKeys.CHALLENGE_REFRESH_INTERVAL_MS
  )!
  const audioRewardsPageChallengePollingTimeout = remoteConfigInstance.getRemoteVar(
    IntKeys.CHALLENGE_REFRESH_INTERVAL_AUDIO_PAGE_MS
  )!

  yield take(fetchAccountSucceeded.type)
  yield fork(function* () {
    yield call(visibilityPollingDaemon, fetchUserChallenges())
  })
  yield call(
    foregroundPollingDaemon,
    fetchUserChallenges(),
    defaultChallengePollingTimeout,
    {
      [AUDIO_PAGE]: audioRewardsPageChallengePollingTimeout
    }
  )
}

const sagas = () => {
  const sagas = [
    watchFetchUserChallenges,
    watchFetchUserChallengesSucceeded,
    watchClaimChallengeReward,
    watchSetHCaptchaStatus,
    watchSetCognitoFlowStatus,
    watchUpdateHCaptchaScore,
    userChallengePollingDaemon,
    watchUpdateOptimisticListenStreak
  ]
  return NATIVE_MOBILE ? sagas.concat(mobileSagas()) : sagas
}

export default sagas
