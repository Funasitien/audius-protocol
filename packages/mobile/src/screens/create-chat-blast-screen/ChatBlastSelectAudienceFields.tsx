import { useCallback } from 'react'

import { useGetCurrentUser } from '@audius/common/api'
import {
  usePurchasersAudience,
  useRemixersAudience
} from '@audius/common/hooks'
import { ChatBlastAudience } from '@audius/sdk'
import { useField } from 'formik'
import { TouchableOpacity } from 'react-native'

import { spacing, Flex, IconCaretRight, Text } from '@audius/harmony-native'
import { ExpandableRadio } from 'app/components/edit/ExpandableRadio'
import { ExpandableRadioGroup } from 'app/components/edit/ExpandableRadioGroup'
import { useNavigation } from 'app/hooks/useNavigation'

const TARGET_AUDIENCE_FIELD = 'target_audience'

const messages = {
  followers: {
    label: 'My Followers',
    description: 'Send a bulk message to all of your followers.'
  },
  supporters: {
    label: 'Tip Supporters',
    description: 'Send a bulk message to everyone who has tipped you.'
  },
  purchasers: {
    label: 'Past Purchasers',
    description:
      'Send a bulk message to everyone who has purchased content from you on Audius.',
    placeholder: 'Premium Content',
    filterBy: 'Filter by Purchased Content',
    search: 'Search for premium content'
  },
  remixCreators: {
    label: 'Remix Creators',
    description:
      'Send a bulk message to creators who have remixed your tracks.',
    placeholder: 'Tracks with Remixes',
    filterBy: 'Filter by Tracks With Remixes',
    search: 'Search for tracks with remixes'
  }
}

export const ChatBlastSelectAudienceFields = () => {
  const [{ value }, , { setValue }] = useField(TARGET_AUDIENCE_FIELD)
  return (
    <ExpandableRadioGroup value={value} onValueChange={setValue}>
      <FollowersMessageField />
      <TipSupportersMessageField />
      <PastPurchasersMessageField />
      <RemixCreatorsMessageField />
    </ExpandableRadioGroup>
  )
}

const LabelWithCount = (props: {
  label: string
  count?: number
  isSelected: boolean
}) => {
  const { label, count, isSelected } = props
  return (
    <Text>
      {label}
      {isSelected && count !== undefined ? (
        <Text color='subdued'> ({count})</Text>
      ) : null}
    </Text>
  )
}

const FollowersMessageField = () => {
  const { data: user } = useGetCurrentUser()
  const [{ value: targetAudience }] = useField(TARGET_AUDIENCE_FIELD)
  const isSelected = targetAudience === ChatBlastAudience.FOLLOWERS

  const isDisabled = user?.follower_count === 0

  return (
    <ExpandableRadio
      value={ChatBlastAudience.FOLLOWERS}
      disabled={isDisabled}
      label={
        <LabelWithCount
          label={messages.followers.label}
          count={user?.follower_count}
          isSelected={isSelected}
        />
      }
      description={messages.followers.description}
    />
  )
}

const TipSupportersMessageField = () => {
  const { data: user } = useGetCurrentUser()
  const [{ value: targetAudience }] = useField(TARGET_AUDIENCE_FIELD)
  const isSelected = targetAudience === ChatBlastAudience.TIPPERS
  const isDisabled = user?.supporter_count === 0

  return (
    <ExpandableRadio
      value={ChatBlastAudience.TIPPERS}
      disabled={isDisabled}
      label={
        <LabelWithCount
          label={messages.supporters.label}
          count={user?.supporter_count}
          isSelected={isSelected}
        />
      }
      description={messages.supporters.description}
    />
  )
}

const PastPurchasersMessageField = () => {
  const navigation = useNavigation()
  const [{ value: targetAudience }] = useField(TARGET_AUDIENCE_FIELD)
  const isSelected = targetAudience === ChatBlastAudience.CUSTOMERS
  const [purchasedContentMetadataField] = useField({
    name: 'purchased_content_metadata',
    type: 'select'
  })
  const { isDisabled, purchasersCount, premiumContentOptions } =
    usePurchasersAudience({
      contentId: purchasedContentMetadataField.value?.contentId,
      contentType: purchasedContentMetadataField.value?.contentType
    })

  const handlePress = useCallback(() => {
    navigation.navigate('ChatBlastSelectContent', {
      valueName: 'purchased_content_metadata',
      title: messages.purchasers.placeholder,
      searchLabel: messages.purchasers.search,
      content: premiumContentOptions
    })
  }, [navigation, premiumContentOptions])

  return (
    <ExpandableRadio
      value={ChatBlastAudience.CUSTOMERS}
      disabled={isDisabled}
      label={
        <LabelWithCount
          label={messages.purchasers.label}
          count={purchasersCount}
          isSelected={isSelected}
        />
      }
      description={messages.purchasers.description}
      checkedContent={
        <TouchableOpacity onPress={handlePress}>
          <Flex
            row
            borderTop='default'
            justifyContent='space-between'
            alignItems='center'
            pt='xl' // TODO: should be l PAY-3430
          >
            <Text variant='body' size='l' strength='strong'>
              {messages.purchasers.filterBy}
            </Text>
            <IconCaretRight
              width={spacing.l}
              height={spacing.l}
              color='subdued'
            />
          </Flex>
        </TouchableOpacity>
      }
    />
  )
}

const RemixCreatorsMessageField = () => {
  const navigation = useNavigation()
  const [{ value: targetAudience }] = useField(TARGET_AUDIENCE_FIELD)
  const isSelected = targetAudience === ChatBlastAudience.REMIXERS
  const [remixedTrackField] = useField({
    name: 'remixed_track_id',
    type: 'select'
  })
  const { isDisabled, remixersCount, remixedTracksOptions } =
    useRemixersAudience({
      remixedTrackId: remixedTrackField.value?.contentId
    })
  const handlePress = useCallback(() => {
    navigation.navigate('ChatBlastSelectContent', {
      valueName: 'remixed_track_id',
      title: messages.remixCreators.placeholder,
      searchLabel: messages.remixCreators.search,
      content: remixedTracksOptions
    })
  }, [navigation, remixedTracksOptions])

  return (
    <ExpandableRadio
      value={ChatBlastAudience.REMIXERS}
      disabled={isDisabled}
      label={
        <LabelWithCount
          label={messages.remixCreators.label}
          count={remixersCount}
          isSelected={isSelected}
        />
      }
      description={messages.remixCreators.description}
      checkedContent={
        <TouchableOpacity onPress={handlePress}>
          <Flex
            row
            borderTop='default'
            justifyContent='space-between'
            alignItems='center'
            pt='xl' // TODO: should be l
          >
            <Text variant='body' size='l' strength='strong'>
              {messages.remixCreators.filterBy}
            </Text>
            <IconCaretRight
              width={spacing.l}
              height={spacing.l}
              color='subdued'
            />
          </Flex>
        </TouchableOpacity>
      }
    />
  )
}
