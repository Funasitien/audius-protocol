import { useState, useCallback, useEffect } from 'react'

import { AnyAction } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

import Audius from 'services/Audius'
import { fetchPendingClaim } from 'store/cache/claims/hooks'
import { fetchUser } from 'store/cache/user/hooks'
import { AppState } from 'store/types'
import { Status, Address } from 'types'

function claimAudiusRewards(
  wallet: Address,
  setStatus: (status: Status) => void,
  setError: (msg: string) => void
): ThunkAction<void, AppState, Audius, Action<string>> {
  return async (dispatch, getState, aud) => {
    setStatus(Status.Loading)
    try {
      await aud.Delegate.claimRewards(wallet)
      await dispatch(fetchPendingClaim(wallet))
      await dispatch(fetchUser(wallet))
      setStatus(Status.Success)
    } catch (err) {
      setStatus(Status.Failure)
      setError(err.message)
    }
  }
}

export const useMakeClaim = (shouldReset?: boolean) => {
  const [status, setStatus] = useState<undefined | Status>()
  const [error, setError] = useState<string>('')
  const dispatch: ThunkDispatch<AppState, Audius, AnyAction> = useDispatch()
  useEffect(() => {
    if (shouldReset) {
      setStatus(undefined)
      setError('')
    }
  }, [shouldReset, setStatus, setError])

  const makeClaim = useCallback(
    (wallet: Address) => {
      if (status !== Status.Loading) {
        dispatch(claimAudiusRewards(wallet, setStatus, setError))
      }
    },
    [dispatch, status, setStatus, setError]
  )
  return { status, error, makeClaim }
}
