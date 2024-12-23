import { useCallback } from 'react'

import { Name, Status } from '@audius/common/models'
import { accountSelectors } from '@audius/common/store'
import { route } from '@audius/common/utils'
import { Button, IconUserFollow as IconFollow } from '@audius/harmony'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { make, useRecord } from 'common/store/analytics/actions'
import { SignOnLink } from 'components/SignOnLink'

const { SIGN_UP_PAGE } = route
const { getAccountStatus, getHasAccount, getIsAccountComplete, getGuestEmail } =
  accountSelectors

const messages = {
  signUp: 'Sign up',
  uploadTrack: 'Upload Track',
  uploading: 'Uploading...',
  finishSignUp: 'Finish Signing Up'
}

export const LeftNavCTA = () => {
  const record = useRecord()
  const isSignedIn = useSelector(getHasAccount)
  const accountStatus = useSelector(getAccountStatus)
  const hasCompletedAccount = useSelector(getIsAccountComplete)
  const guestEmail = useSelector(getGuestEmail)

  let status = 'signedOut'
  if (isSignedIn) status = 'signedIn'
  if (accountStatus === Status.LOADING) status = 'loading'
  if (!hasCompletedAccount && guestEmail) status = 'guest'

  const handleSignup = useCallback(() => {
    record(make(Name.CREATE_ACCOUNT_OPEN, { source: 'nav button' }))
  }, [record])

  let button
  switch (status) {
    case 'signedIn':
    case 'uploading':
      button = null
      break
    case 'loading':
      button = null
      break
    case 'guest':
      button = (
        <Button variant='primary' size='small' asChild>
          <SignOnLink signUp>{messages.finishSignUp}</SignOnLink>
        </Button>
      )
      break
    case 'signedOut':
    default:
      button = (
        <Button
          variant='primary'
          size='small'
          asChild
          iconLeft={IconFollow}
          onClick={handleSignup}
        >
          <Link to={SIGN_UP_PAGE}>{messages.signUp}</Link>
        </Button>
      )
      break
  }

  return button
}
