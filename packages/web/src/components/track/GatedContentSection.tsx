import { useCallback, useState } from 'react'

import { useInterval } from '@audius/common/hooks'
import {
  FollowSource,
  ModalSource,
  Chain,
  isContentCollectibleGated,
  isContentFollowGated,
  isContentTipGated,
  isContentUSDCPurchaseGated,
  ID,
  AccessConditions,
  User,
  isContentCrowdfundGated
} from '@audius/common/models'
import {
  cacheUsersSelectors,
  usersSocialActions as socialActions,
  tippingActions,
  usePremiumContentPurchaseModal,
  gatedContentSelectors,
  PurchaseableContentType,
  accountSelectors,
  gatedContentActions
} from '@audius/common/store'
import { formatPrice, removeNullable, Nullable } from '@audius/common/utils'
import { wAUDIO } from '@audius/fixed-decimal'
import {
  Flex,
  Text,
  IconExternalLink,
  IconCart,
  IconCollectible,
  IconSpecialAccess,
  IconLogoCircleETH,
  IconLogoCircleSOL,
  useTheme,
  Button,
  IconUserFollow,
  IconTipping,
  ProgressBar,
  LoadingSpinner,
  IconUserGroup
} from '@audius/harmony'
import { AnchorProvider, Program, Provider, Wallet } from '@coral-xyz/anchor'
import { getAccount } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'
import { AsyncState } from 'react-use/lib/useAsyncFn'

import { useModalState } from 'common/hooks/useModalState'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import { UserLink } from 'components/link'
import UserBadges from 'components/user-badges/UserBadges'
import { useAuthenticatedCallback } from 'hooks/useAuthenticatedCallback'
import { emptyStringGuard } from 'pages/track-page/utils'
import { audiusSdk } from 'services/audius-sdk'
import { Crowdfund } from 'services/crowdfund/crowdfund'
import IDL from 'services/crowdfund/crowdfund.json'
import { env } from 'services/env'
import { AppState } from 'store/types'
import { profilePage } from 'utils/route'

import { LockedStatusPill } from '../locked-status-pill'

import styles from './GiantTrackTile.module.css'

const { getUsers } = cacheUsersSelectors
const { beginTip } = tippingActions
const { getGatedContentStatusMap } = gatedContentSelectors

const getMessages = (contentType: PurchaseableContentType) => ({
  howToUnlock: 'HOW TO UNLOCK',
  payToUnlock: 'PAY TO UNLOCK',
  purchasing: 'PURCHASING',
  unlocking: 'UNLOCKING',
  unlocked: 'UNLOCKED',
  collectibleGated: 'COLLECTIBLE GATED',
  specialAccess: 'SPECIAL ACCESS',
  crowdfund: 'CROWDFUND',
  goToCollection: 'Open Collection',
  sendTip: 'Send Tip',
  followArtist: 'Follow Artist',
  period: '.',
  exclamationMark: '!',
  ownCollectibleGatedPrefix:
    'Users can unlock access by linking a wallet containing a collectible from ',
  unlockCollectibleGatedContent: `To unlock this ${contentType}, you must link a wallet containing a collectible from `,
  aCollectibleFrom: 'A Collectible from ',
  unlockingCollectibleGatedContentSuffix: 'was found in a linked wallet.',
  unlockedCollectibleGatedContentSuffix: `was found in a linked wallet. This ${contentType} is now available.`,
  ownFollowGated: 'Users can unlock access by following your account!',
  unlockFollowGatedContentPrefix: 'Follow',
  thankYouForFollowing: 'Thank you for following',
  unlockedFollowGatedContentSuffix: `! This ${contentType} is now available.`,
  ownTipGated: 'Users can unlock access by sending you a tip!',
  unlockTipGatedContentPrefix: 'Send',
  unlockTipGatedContentSuffix: 'a tip.',
  thankYouForSupporting: 'Thank you for supporting',
  unlockingTipGatedContentSuffix: 'by sending them a tip!',
  unlockedTipGatedContentSuffix: `by sending them a tip! This ${contentType} is now available.`,
  unlockWithPurchase: `Unlock this ${contentType} with a one-time purchase!`,
  purchased: `You've purchased this ${contentType}.`,
  buy: (price: string) => `Buy $${price}`,
  contribute: `Contribute`,
  usersCanPurchase: (price: string) =>
    `Users can unlock access to this ${contentType} for a one time purchase of $${price}`,
  unlockWithFunding: `Unlock this ${contentType} by contributing funds and reaching the $AUDIO fundraising goal.`,
  usersCanFund: (threshold: string) =>
    `Users can unlock access to this ${contentType} by collectively reaching the funding goal of ${threshold} $AUDIO. Once the funding threshold is reached, the $AUDIO will be sent to your wallet and the track will be unlocked for everyone.`,
  unlock: 'Unlock',
  funded: `This ${contentType} has been completely crowdfunded as is now available.`
})

const getCrowdfundMeta = async (
  streamConditions: Nullable<AccessConditions>
) => {
  if (!isContentCrowdfundGated(streamConditions)) {
    return null
  }
  try {
    const sdk = await audiusSdk()
    const provider = new AnchorProvider(
      sdk.services.claimableTokensClient.connection,
      {} as Wallet
    )
    const program = new Program(IDL as Crowdfund, provider)
    const campaign = await program.account.campaignAccount.fetch(
      streamConditions.crowdfund.campaign,
      'confirmed'
    )
    const escrow = await getAccount(
      sdk.services.claimableTokensClient.connection,
      new PublicKey(streamConditions.crowdfund.escrow),
      'confirmed'
    )
    return {
      threshold: campaign.fundingThreshold,
      balance: escrow.amount,
      destination: campaign.destinationWallet
    }
  } catch {
    return null
  }
}

const useCrowdfundCampaign = (
  streamConditions: Nullable<AccessConditions>,
  intervalMs: number
) => {
  const [refreshToggle, setRefreshToggle] = useState(false)
  useInterval(() => {
    setRefreshToggle((t) => !t)
  }, intervalMs)
  const campaign = useAsync(
    async () => getCrowdfundMeta(streamConditions),
    [streamConditions, refreshToggle]
  )
  return campaign
}

const CampaignProgress = ({
  campaign
}: {
  campaign: AsyncState<{ threshold: BN; balance: bigint } | null>
}) => (
  <Flex direction='column' gap='s' w='100%'>
    <ProgressBar
      value={new BN(campaign.value?.balance.toString() ?? 0)}
      min={new BN(0)}
      max={new BN(campaign.value?.threshold ?? 1)}
    />
    <Text variant='body' strength='strong' textAlign='right'>
      {wAUDIO(campaign.value?.balance ?? 0).toLocaleString()} /{' '}
      {wAUDIO(campaign.value?.threshold ?? 1).toLocaleString()} $AUDIO
    </Text>
  </Flex>
)

type GatedContentAccessSectionProps = {
  contentId: ID
  contentType: PurchaseableContentType
  trackOwner: Nullable<User>
  streamConditions: AccessConditions
  followee: Nullable<User>
  tippedUser: Nullable<User>
  goToCollection: () => void
  renderArtist: (entity: User) => JSX.Element
  isOwner: boolean
  className?: string
  buttonClassName?: string
  source?: ModalSource
}

const LockedGatedContentSection = ({
  contentId,
  contentType,
  streamConditions,
  followee,
  tippedUser,
  goToCollection,
  renderArtist,
  className,
  buttonClassName,
  source: premiumModalSource
}: GatedContentAccessSectionProps) => {
  const messages = getMessages(contentType)
  const dispatch = useDispatch()
  const [lockedContentModalVisibility, setLockedContentModalVisibility] =
    useModalState('LockedContent')
  const { onOpen: openPremiumContentPurchaseModal } =
    usePremiumContentPurchaseModal()
  const tipSource = lockedContentModalVisibility
    ? 'howToUnlockModal'
    : 'howToUnlockTrackPage'
  const followSource = lockedContentModalVisibility
    ? FollowSource.HOW_TO_UNLOCK_MODAL
    : FollowSource.HOW_TO_UNLOCK_TRACK_PAGE
  const isUSDCPurchaseGated = isContentUSDCPurchaseGated(streamConditions)
  const { spacing } = useTheme()
  const user = useSelector(accountSelectors.getAccountUser)

  const campaign = useCrowdfundCampaign(streamConditions, 1000)

  const handlePurchase = useAuthenticatedCallback(() => {
    if (lockedContentModalVisibility) {
      setLockedContentModalVisibility(false)
    }
    openPremiumContentPurchaseModal(
      { contentId, contentType },
      { source: premiumModalSource ?? ModalSource.TrackDetails }
    )
  }, [
    contentId,
    contentType,
    lockedContentModalVisibility,
    openPremiumContentPurchaseModal,
    setLockedContentModalVisibility,
    premiumModalSource
  ])

  const handleSendTip = useAuthenticatedCallback(() => {
    dispatch(
      beginTip({ user: tippedUser, source: tipSource, trackId: contentId })
    )

    if (lockedContentModalVisibility) {
      setLockedContentModalVisibility(false)
    }
  }, [
    dispatch,
    tippedUser,
    tipSource,
    contentId,
    lockedContentModalVisibility,
    setLockedContentModalVisibility
  ])

  const handleFollow = useAuthenticatedCallback(() => {
    if (isContentFollowGated(streamConditions)) {
      dispatch(
        socialActions.followUser(
          streamConditions.follow_user_id,
          followSource,
          contentId
        )
      )
    }

    if (lockedContentModalVisibility) {
      setLockedContentModalVisibility(false)
    }
  }, [
    dispatch,
    streamConditions,
    followSource,
    contentId,
    lockedContentModalVisibility,
    setLockedContentModalVisibility
  ])

  const handleContribute = useAuthenticatedCallback(async () => {
    const sdk = await audiusSdk()
    const { claimableTokensClient, auth } = sdk.services
    const ethWallet = user?.wallet
    if (!isContentCrowdfundGated(streamConditions) || !ethWallet) {
      return
    }
    const destination = new PublicKey(streamConditions.crowdfund.escrow)
    const secp = await claimableTokensClient.createTransferSecpInstruction({
      amount: wAUDIO(1).value,
      ethWallet,
      mint: 'wAUDIO',
      destination,
      auth
    })
    const transfer = await claimableTokensClient.createTransferInstruction({
      ethWallet,
      mint: 'wAUDIO',
      destination
    })
    const tx = await claimableTokensClient.buildTransaction({
      instructions: [secp, transfer]
    })
    await claimableTokensClient.sendTransaction(tx)
  }, [streamConditions, user?.wallet])

  const handleUnlock = useAuthenticatedCallback(async () => {
    const sdk = await audiusSdk()
    const { claimableTokensClient, solanaRelay } = sdk.services
    if (!isContentCrowdfundGated(streamConditions) || !campaign.value) {
      return
    }
    const program = new Program(IDL as Crowdfund, {} as Provider)
    const instruction = await program.methods
      .unlock({
        contentId,
        contentType: contentType === PurchaseableContentType.TRACK ? 1 : 2
      })
      .accounts({
        mint: new PublicKey(env.WAUDIO_MINT_ADDRESS),
        feePayerWallet: await solanaRelay.getFeePayer(),
        destinationAccount: campaign.value.destination
      })
      .instruction()
    const tx = await claimableTokensClient.buildTransaction({
      instructions: [instruction]
    })
    await claimableTokensClient.sendTransaction(tx)
    dispatch(
      gatedContentActions.updateGatedContentStatus({
        contentId,
        status: 'UNLOCKING'
      })
    )
    dispatch(
      gatedContentActions.startPollingGatedContent({
        contentId,
        contentType,
        isSourceTrack: true
      })
    )
  }, [campaign.value, contentId, contentType, dispatch, streamConditions])

  const renderLockedDescription = () => {
    if (isContentCollectibleGated(streamConditions)) {
      const { nft_collection } = streamConditions
      const { imageUrl, name, chain } = nft_collection
      const ChainIcon =
        chain === Chain.Eth ? IconLogoCircleETH : IconLogoCircleSOL
      return (
        <Text variant='body' strength='strong'>
          <div className={styles.collectibleGatedDescription}>
            {messages.unlockCollectibleGatedContent}
          </div>
          <div
            className={styles.gatedContentSectionCollection}
            onClick={goToCollection}
          >
            {imageUrl && (
              <div className={styles.collectionIconsContainer}>
                <img
                  src={imageUrl}
                  alt={`${name} nft collection`}
                  className={styles.collectibleImage}
                />
                <ChainIcon css={{ position: 'relative', left: -spacing.s }} />
              </div>
            )}
            <span>{name}</span>
          </div>
        </Text>
      )
    }

    if (isContentFollowGated(streamConditions) && followee) {
      return (
        <Text variant='body' strength='strong'>
          {messages.unlockFollowGatedContentPrefix}&nbsp;
          <UserLink userId={followee.user_id} />
          {messages.period}
        </Text>
      )
    }

    if (isContentTipGated(streamConditions) && tippedUser) {
      return (
        <Text variant='body' strength='strong'>
          {messages.unlockTipGatedContentPrefix}&nbsp;
          <UserLink userId={tippedUser.user_id} />
          {messages.unlockTipGatedContentSuffix}
        </Text>
      )
    }

    if (isContentUSDCPurchaseGated(streamConditions)) {
      return (
        <Text variant='body' strength='strong' textAlign='left'>
          {messages.unlockWithPurchase}
        </Text>
      )
    }
    if (isContentCrowdfundGated(streamConditions)) {
      return (
        <Text variant='body' strength='strong' textAlign='left'>
          {messages.unlockWithFunding}
        </Text>
      )
    }

    console.warn(
      'No entity for stream conditions... should not have reached here.'
    )
    return null
  }

  const renderButton = () => {
    if (isContentCollectibleGated(streamConditions)) {
      return (
        <Button
          variant='primary'
          color='blue'
          onClick={goToCollection}
          iconRight={IconExternalLink}
          fullWidth
        >
          {messages.goToCollection}
        </Button>
      )
    }

    if (isContentFollowGated(streamConditions)) {
      return (
        <Button
          variant='primary'
          color='blue'
          onClick={handleFollow}
          iconLeft={IconUserFollow}
          fullWidth
        >
          {messages.followArtist}
        </Button>
      )
    }

    if (isContentTipGated(streamConditions)) {
      return (
        <Button
          variant='primary'
          color='blue'
          onClick={handleSendTip}
          iconRight={IconTipping}
          fullWidth
        >
          {messages.sendTip}
        </Button>
      )
    }

    if (isContentUSDCPurchaseGated(streamConditions)) {
      return (
        <Button
          variant='primary'
          color='lightGreen'
          onClick={handlePurchase}
          fullWidth
        >
          {messages.buy(formatPrice(streamConditions.usdc_purchase.price))}
        </Button>
      )
    }

    if (isContentCrowdfundGated(streamConditions)) {
      if (
        campaign.value &&
        new BN(campaign.value.balance.toString()).gte(campaign.value.threshold)
      ) {
        return (
          <Button variant='primary' onClick={handleUnlock} fullWidth>
            {messages.unlock}
          </Button>
        )
      }
      return (
        <Button
          variant='primary'
          color='blue'
          onClick={handleContribute}
          fullWidth
        >
          {messages.contribute}
        </Button>
      )
    }

    console.warn(
      'No entity for stream conditions... should not have reached here.'
    )
    return null
  }

  return (
    <Flex className={className} justifyContent='space-between' wrap='wrap'>
      <Flex gap='s' direction='column'>
        <Flex alignItems='center' gap='s'>
          <LockedStatusPill
            locked
            variant={isUSDCPurchaseGated ? 'premium' : 'gated'}
          />
          <Text variant='label' size='l' strength='strong'>
            {isUSDCPurchaseGated ? messages.payToUnlock : messages.howToUnlock}
          </Text>
        </Flex>
        {renderLockedDescription()}
      </Flex>
      <div className={cn(styles.gatedContentSectionButton, buttonClassName)}>
        {renderButton()}
      </div>
      {isContentCrowdfundGated(streamConditions) ? (
        <CampaignProgress campaign={campaign} />
      ) : null}
    </Flex>
  )
}

const UnlockingGatedContentSection = ({
  contentType,
  streamConditions,
  followee,
  tippedUser,
  goToCollection,
  renderArtist,
  className
}: GatedContentAccessSectionProps) => {
  const messages = getMessages(contentType)
  const renderUnlockingDescription = () => {
    if (isContentCollectibleGated(streamConditions)) {
      return (
        <div>
          <span>{messages.aCollectibleFrom}</span>
          <span className={styles.collectibleName} onClick={goToCollection}>
            &nbsp;{streamConditions.nft_collection?.name}&nbsp;
          </span>
          <span>{messages.unlockingCollectibleGatedContentSuffix}</span>
        </div>
      )
    }

    if (isContentFollowGated(streamConditions) && followee) {
      return (
        <Text>
          {messages.thankYouForFollowing}
          <UserLink userId={followee.user_id} />
          {messages.exclamationMark}
        </Text>
      )
    }

    if (isContentTipGated(streamConditions) && tippedUser) {
      return (
        <div>
          <span>{messages.thankYouForSupporting}&nbsp;</span>
          {renderArtist(tippedUser)}
          <span className={styles.suffix}>
            {messages.unlockingTipGatedContentSuffix}
          </span>
        </div>
      )
    }

    if (isContentUSDCPurchaseGated(streamConditions)) {
      return (
        <Text variant='body' strength='strong'>
          {messages.unlockWithPurchase}
        </Text>
      )
    }

    console.warn(
      'No entity for stream conditions... should not have reached here.'
    )
    return null
  }

  return (
    <div className={className}>
      <Flex
        direction='row'
        className={styles.gatedContentDescriptionContainer}
        alignItems='flex-start'
        gap='s'
      >
        <Text variant='label' size='l' strength='strong'>
          <Flex alignItems='center' gap='s'>
            <LoadingSpinner className={styles.spinner} />
            {isContentUSDCPurchaseGated(streamConditions)
              ? messages.purchasing
              : messages.unlocking}
          </Flex>
        </Text>
        <Text variant='body' strength='strong'>
          {renderUnlockingDescription()}
        </Text>
      </Flex>
    </div>
  )
}

const UnlockedGatedContentSection = ({
  contentType,
  streamConditions,
  followee,
  tippedUser,
  goToCollection,
  renderArtist,
  isOwner,
  trackOwner,
  className
}: GatedContentAccessSectionProps) => {
  const messages = getMessages(contentType)

  const campaign = useCrowdfundCampaign(streamConditions, 1000)

  const renderUnlockedDescription = () => {
    if (isContentCollectibleGated(streamConditions)) {
      return isOwner ? (
        <>
          {messages.ownCollectibleGatedPrefix}
          <span className={styles.collectibleName} onClick={goToCollection}>
            {streamConditions.nft_collection?.name}
          </span>
        </>
      ) : (
        <>
          {messages.aCollectibleFrom}
          <span className={styles.collectibleName} onClick={goToCollection}>
            {streamConditions.nft_collection?.name}
          </span>
          &nbsp;
          {messages.unlockedCollectibleGatedContentSuffix}
        </>
      )
    }

    if (isContentFollowGated(streamConditions) && followee) {
      return isOwner ? (
        messages.ownFollowGated
      ) : (
        <>
          {messages.thankYouForFollowing}&nbsp;
          <UserLink userId={followee.user_id} />
          {messages.unlockedFollowGatedContentSuffix}
        </>
      )
    }

    if (isContentTipGated(streamConditions) && tippedUser) {
      return isOwner ? (
        messages.ownTipGated
      ) : (
        <>
          {messages.thankYouForSupporting}&nbsp;
          <UserLink userId={tippedUser.user_id} />
          {messages.unlockedTipGatedContentSuffix}
        </>
      )
    }

    if (isContentUSDCPurchaseGated(streamConditions)) {
      return isOwner ? (
        <div>
          <span>
            {messages.usersCanPurchase(
              formatPrice(streamConditions.usdc_purchase.price)
            )}
          </span>
        </div>
      ) : (
        <Flex direction='row' wrap='wrap'>
          <span>{messages.purchased}&nbsp;</span>
          {trackOwner ? (
            <>
              <Flex direction='row'>
                {messages.thankYouForSupporting}&nbsp;
                {renderArtist(trackOwner)}
                {messages.period}
              </Flex>
            </>
          ) : null}
        </Flex>
      )
    }

    if (isContentCrowdfundGated(streamConditions)) {
      return isOwner && campaign.value !== null ? (
        <Flex direction='column' gap='s'>
          {messages.usersCanFund(
            wAUDIO(campaign.value?.threshold ?? 1).toLocaleString()
          )}
          <CampaignProgress campaign={campaign} />
        </Flex>
      ) : (
        <Flex direction='row' wrap='wrap'>
          <span>{messages.funded}</span>
          {trackOwner ? (
            <>
              <Flex direction='row'>
                {messages.thankYouForSupporting}&nbsp;
                {renderArtist(trackOwner)}
                {messages.period}
              </Flex>
            </>
          ) : null}
        </Flex>
      )
    }

    console.warn(
      'No entity for stream conditions... should not have reached here.'
    )
    return null
  }

  let IconComponent = IconSpecialAccess
  let gatedConditionTitle = messages.specialAccess

  if (isContentCollectibleGated(streamConditions)) {
    IconComponent = IconCollectible
    gatedConditionTitle = messages.collectibleGated
  } else if (isContentUSDCPurchaseGated(streamConditions)) {
    IconComponent = IconCart
    gatedConditionTitle = messages.payToUnlock
  } else if (isContentCrowdfundGated(streamConditions)) {
    IconComponent = IconUserGroup
    gatedConditionTitle = messages.crowdfund
  }

  return (
    <div className={className}>
      <Text
        variant='label'
        size='l'
        strength='strong'
        className={cn(styles.gatedContentSectionTitle, {
          [styles.isOwner]: isOwner
        })}
      >
        {isOwner ? (
          <IconComponent className={styles.gatedContentIcon} />
        ) : (
          <LockedStatusPill
            locked={false}
            variant={
              isContentUSDCPurchaseGated(streamConditions) ? 'premium' : 'gated'
            }
          />
        )}
        {isOwner ? gatedConditionTitle : messages.unlocked}
      </Text>
      <Text
        variant='body'
        strength='strong'
        className={styles.gatedContentSectionDescription}
      >
        {renderUnlockedDescription()}
      </Text>
    </div>
  )
}

type GatedContentSectionProps = {
  isLoading: boolean
  contentId: ID
  contentType: PurchaseableContentType
  streamConditions: AccessConditions
  hasStreamAccess?: boolean
  isOwner: boolean
  wrapperClassName?: string
  className?: string
  buttonClassName?: string
  ownerId: ID | null
  /** More context for analytics to know about where purchases are being triggered from */
  source?: ModalSource
}

export const GatedContentSection = ({
  isLoading,
  contentId,
  contentType = PurchaseableContentType.TRACK,
  streamConditions,
  hasStreamAccess,
  isOwner,
  wrapperClassName,
  className,
  buttonClassName,
  ownerId,
  source
}: GatedContentSectionProps) => {
  const dispatch = useDispatch()
  const gatedContentStatusMap = useSelector(getGatedContentStatusMap)
  const gatedContentStatus = gatedContentStatusMap[contentId] ?? null

  const isFollowGated = isContentFollowGated(streamConditions)
  const isTipGated = isContentTipGated(streamConditions)
  const isUSDCPurchaseGated = isContentUSDCPurchaseGated(streamConditions)
  const isCrowdfundGated = isContentCrowdfundGated(streamConditions)
  const shouldDisplay =
    isFollowGated ||
    isTipGated ||
    isContentCollectibleGated(streamConditions) ||
    isUSDCPurchaseGated ||
    isCrowdfundGated
  const users = useSelector<AppState, { [id: ID]: User }>((state) =>
    getUsers(state, {
      ids: [
        isFollowGated ? streamConditions.follow_user_id : null,
        isTipGated ? streamConditions.tip_user_id : null,
        isUSDCPurchaseGated ? ownerId : null
      ].filter(removeNullable)
    })
  )
  const followee = isFollowGated ? users[streamConditions.follow_user_id] : null
  const trackOwner =
    isUSDCPurchaseGated && ownerId !== null ? users[ownerId] : null
  const tippedUser = isTipGated ? users[streamConditions.tip_user_id] : null

  const fadeIn = {
    [styles.show]: !isLoading,
    [styles.hide]: isLoading
  }

  const handleGoToCollection = useCallback(() => {
    if (!isContentCollectibleGated(streamConditions)) return
    const { chain, address, externalLink } =
      streamConditions.nft_collection ?? {}
    if (chain === Chain.Eth && 'slug' in streamConditions.nft_collection!) {
      const url = `https://opensea.io/collection/${streamConditions.nft_collection.slug}`
      window.open(url, '_blank')
    } else if (chain === Chain.Sol) {
      if (externalLink) {
        const url = new URL(externalLink)
        window.open(`${url.protocol}//${url.hostname}`)
      } else {
        const explorerUrl = `https://explorer.solana.com/address/${address}`
        window.open(explorerUrl, '_blank')
      }
    }
  }, [streamConditions])

  const renderArtist = useCallback(
    (entity: User) => (
      <ArtistPopover
        handle={entity.handle}
        mouseEnterDelay={0.1}
        component='span'
      >
        <h2
          className={styles.gatedContentOwner}
          onClick={() =>
            dispatch(pushRoute(profilePage(emptyStringGuard(entity.handle))))
          }
        >
          {entity.name}
          <UserBadges
            userId={entity.user_id}
            className={styles.badgeIcon}
            badgeSize={14}
            useSVGTiers
          />
        </h2>
      </ArtistPopover>
    ),
    [dispatch]
  )

  if (!streamConditions) return null
  if (!shouldDisplay) return null

  if (hasStreamAccess) {
    return (
      <div className={cn(styles.gatedContentSection, fadeIn, wrapperClassName)}>
        <UnlockedGatedContentSection
          contentId={contentId}
          contentType={contentType}
          trackOwner={trackOwner}
          streamConditions={streamConditions}
          followee={followee}
          tippedUser={tippedUser}
          goToCollection={handleGoToCollection}
          renderArtist={renderArtist}
          isOwner={isOwner}
          className={className}
        />
      </div>
    )
  }

  if (gatedContentStatus === 'UNLOCKING') {
    return (
      <div className={cn(styles.gatedContentSection, fadeIn, wrapperClassName)}>
        <UnlockingGatedContentSection
          contentId={contentId}
          contentType={contentType}
          trackOwner={trackOwner}
          streamConditions={streamConditions}
          followee={followee}
          tippedUser={tippedUser}
          goToCollection={handleGoToCollection}
          renderArtist={renderArtist}
          isOwner={isOwner}
          className={className}
        />
      </div>
    )
  }

  return (
    <div className={cn(styles.gatedContentSection, fadeIn, wrapperClassName)}>
      <LockedGatedContentSection
        contentId={contentId}
        contentType={contentType}
        trackOwner={trackOwner}
        streamConditions={streamConditions}
        followee={followee}
        tippedUser={tippedUser}
        goToCollection={handleGoToCollection}
        renderArtist={renderArtist}
        isOwner={isOwner}
        className={cn(styles.gatedContentSectionLocked, className)}
        buttonClassName={buttonClassName}
        source={source}
      />
    </div>
  )
}
