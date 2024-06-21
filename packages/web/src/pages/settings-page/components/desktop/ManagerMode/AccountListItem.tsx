import { useCallback, useMemo } from 'react'

import { useAccountSwitcher, useIsManagedAccount } from '@audius/common/hooks'
import { SquareSizes, User, UserMetadata } from '@audius/common/models'
import { accountSelectors, chatSelectors } from '@audius/common/store'
import {
  Button,
  Flex,
  IconButton,
  IconCheck,
  IconCloseAlt,
  IconKebabHorizontal,
  IconMessage,
  IconTrash,
  IconUser,
  IconUserArrowRotate,
  PopupMenu,
  Text,
  useTheme
} from '@audius/harmony'

import DynamicImage from 'components/dynamic-image/DynamicImage'
import UserBadges from 'components/user-badges/UserBadges'
import { useNavigateToPage } from 'hooks/useNavigateToPage'
import { useProfilePicture } from 'hooks/useUserProfilePicture'
import { useComposeChat } from 'pages/chat-page/components/useComposeChat'
import { useSelector } from 'utils/reducer'
import { profilePage } from 'utils/route'
import zIndex from 'utils/zIndex'

import styles from './AccountListItem.module.css'

const { getUserId } = accountSelectors
const { getCanCreateChat } = chatSelectors

const messages = {
  moreOptions: 'more options',
  removeManager: 'Remove Manager',
  stopManaging: 'Stop Managing',
  visitProfile: 'Visit Profile',
  sendMessage: 'Send Message',
  invitePending: 'Invite Pending',
  cancelInvite: 'Cancel Invite',
  switchToUser: 'Switch to User'
}

type AccountListItemProps = {
  isPending: boolean
  user: User | UserMetadata
  isManagedAccount?: boolean
  onRemoveManager: (params: { userId: number; managerUserId: number }) => void
  onCancelInvite?: (params: { userId: number; managerUserId: number }) => void
  onApprove?: (params: {
    currentUserId: number
    grantorUser: User | UserMetadata
  }) => void
  onReject?: (params: {
    currentUserId: number
    grantorUser: User | UserMetadata
  }) => void
}

const ArtistInfo = ({ user }: { user: UserMetadata }) => {
  const profilePicture = useProfilePicture(
    user.user_id,
    SquareSizes.SIZE_150_BY_150
  )
  const { iconSizes } = useTheme()
  return (
    <Flex gap='m' alignItems='center' justifyContent='flex-start'>
      <DynamicImage
        wrapperClassName={styles.profilePictureWrapper}
        skeletonClassName={styles.profilePictureSkeleton}
        className={styles.profilePicture}
        image={profilePicture}
      />
      <Flex direction='column' gap='xs'>
        <Flex gap='xs' alignItems='center' justifyContent='flex-start'>
          <Text variant='body' size='m' strength='strong'>
            {user.name}
          </Text>
          <UserBadges userId={user.user_id} badgeSize={iconSizes.m} inline />
        </Flex>
        <Text variant='body' size='m'>{`@${user.handle}`}</Text>
      </Flex>
    </Flex>
  )
}

export const AccountListItem = ({
  isPending,
  user,
  isManagedAccount,
  onRemoveManager,
  onCancelInvite,
  onApprove,
  onReject
}: AccountListItemProps) => {
  const currentUserId = useSelector(getUserId)
  const isManagerMode = useIsManagedAccount()

  const navigate = useNavigateToPage()
  const goToProfile = useCallback(() => {
    if (!user) return
    navigate(profilePage(user.handle))
  }, [navigate, user])

  const { switchAccount } = useAccountSwitcher()

  const { canCreateChat } = useSelector((state) =>
    getCanCreateChat(state, { userId: user?.user_id })
  )

  const composeChat = useComposeChat({
    // @ts-expect-error - This wants a User, but works with UserMetadata
    user
  })

  const handleRemoveManager = useCallback(() => {
    if (!currentUserId) return
    onRemoveManager({
      userId: isManagedAccount ? user.user_id : currentUserId,
      managerUserId: isManagedAccount ? currentUserId : user.user_id
    })
  }, [currentUserId, isManagedAccount, user.user_id, onRemoveManager])

  const handleCancelInvite = useCallback(() => {
    if (!currentUserId) return
    onCancelInvite?.({
      userId: currentUserId,
      managerUserId: user.user_id
    })
  }, [currentUserId, user.user_id, onCancelInvite])

  const popupMenuItems = useMemo(() => {
    const items = []
    if (isManagedAccount) {
      if (!isPending) {
        items.push({
          icon: <IconTrash />,
          text: messages.stopManaging,
          onClick: handleRemoveManager
        })
      }
    } else {
      items.push({
        icon: <IconTrash />,
        text: isPending ? messages.cancelInvite : messages.removeManager,
        onClick: isPending ? handleCancelInvite : handleRemoveManager
      })
    }
    items.push({
      icon: <IconUser />,
      text: messages.visitProfile,
      onClick: goToProfile
    })

    // Don't show DM/switch options if we're in manager mode as the
    // logged in user won't have permission to do those things on behalf of a
    // managed account.
    if (canCreateChat && !isManagerMode) {
      items.push({
        icon: <IconMessage />,
        text: messages.sendMessage,
        onClick: composeChat
      })
    }

    if (isManagedAccount && !isManagerMode) {
      items.push({
        icon: <IconUserArrowRotate />,
        text: messages.switchToUser,
        onClick: () => switchAccount(user)
      })
    }

    return items
  }, [
    user,
    switchAccount,
    isManagedAccount,
    isManagerMode,
    isPending,
    handleCancelInvite,
    handleRemoveManager,
    goToProfile,
    composeChat,
    canCreateChat
  ])

  const handleApprove = useCallback(() => {
    if (!currentUserId) return
    onApprove?.({ currentUserId, grantorUser: user })
  }, [user, onApprove, currentUserId])

  const handleReject = useCallback(() => {
    if (!currentUserId) return
    onReject?.({ currentUserId, grantorUser: user })
  }, [user, onReject, currentUserId])

  const renderTrigger = (
    anchorRef: React.MutableRefObject<any>,
    triggerPopup: () => void
  ) => (
    <IconButton
      ref={anchorRef}
      aria-label={messages.moreOptions}
      icon={IconKebabHorizontal}
      color='subdued'
      onClick={() => triggerPopup()}
    />
  )

  if (!user || !currentUserId) return null

  return (
    <Flex
      alignItems='stretch'
      justifyContent='space-between'
      pl='xl'
      pr='l'
      pv='l'
      gap='l'
      border='default'
    >
      <ArtistInfo user={user} />
      <Flex direction='column' justifyContent='space-between' alignItems='end'>
        {!isPending || !isManagedAccount ? (
          <PopupMenu
            renderTrigger={renderTrigger}
            items={popupMenuItems}
            zIndex={zIndex.MODAL_OVERFLOW_MENU_POPUP}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          />
        ) : null}
        {isPending && !isManagedAccount ? (
          <Text variant='label' size='s' color='subdued'>
            {messages.invitePending}
          </Text>
        ) : null}
      </Flex>
      {isManagedAccount && isPending ? (
        <Flex direction='column' gap='s'>
          <Text variant='label' size='s' color='subdued'>
            {messages.invitePending}
          </Text>
          <Flex gap='s' alignSelf='end'>
            <Button
              size='small'
              variant='secondary'
              aria-label='approve'
              iconLeft={IconCheck}
              onClick={handleApprove}
            />
            <Button
              size='small'
              variant='destructive'
              aria-label='reject'
              iconRight={IconCloseAlt}
              onClick={handleReject}
            />
          </Flex>
        </Flex>
      ) : null}
    </Flex>
  )
}
