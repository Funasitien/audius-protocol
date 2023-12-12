import { css } from '@emotion/native'
import { BlurView } from '@react-native-community/blur'
import type { ImageURISource } from 'react-native'
import { ImageBackground, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {
  Avatar,
  Flex,
  IconCamera,
  IconImage,
  IconVerified,
  Text,
  useTheme
} from '@audius/harmony-native'

type AccountHeaderProps = {
  onSelectCoverPhoto?: () => void
  onSelectProfilePicture?: () => void
  profilePicture?: ImageURISource
  coverPhoto?: ImageURISource
  displayName?: string
  handle?: string
  isVerified?: boolean
}

export const AccountHeader = (props: AccountHeaderProps) => {
  const {
    onSelectCoverPhoto,
    onSelectProfilePicture,
    profilePicture,
    coverPhoto,
    displayName,
    handle,
    isVerified
  } = props

  const { spacing } = useTheme()

  return (
    <Flex>
      <CoverPhoto
        onSelectCoverPhoto={onSelectCoverPhoto}
        profilePicture={profilePicture}
        coverPhoto={coverPhoto}
      />
      <Flex
        direction='row'
        alignItems='flex-start'
        gap='s'
        style={css({
          position: 'absolute',
          left: spacing.unit4,
          top: spacing.unit10
        })}
      >
        <ProfilePicture
          profilePicture={profilePicture}
          onSelectProfilePicture={onSelectProfilePicture}
        />
        <AccountDetails
          displayName={displayName}
          handle={handle}
          isVerified={isVerified}
          emphasis={!coverPhoto}
        />
      </Flex>
    </Flex>
  )
}

type CoverPhotoProps = {
  onSelectCoverPhoto?: () => void
  profilePicture?: ImageURISource
  coverPhoto?: ImageURISource
}

const CoverPhoto = (props: CoverPhotoProps) => {
  const { onSelectCoverPhoto, profilePicture, coverPhoto } = props
  const { color, cornerRadius, spacing } = useTheme()
  const isEdit = onSelectCoverPhoto

  const borderRadiusStyle = css({
    borderTopLeftRadius: cornerRadius.m,
    borderTopRightRadius: cornerRadius.m,
    overflow: 'hidden'
  })

  const rootCss = css({
    backgroundColor: color.neutral.n300,
    height: 96
  })

  return (
    <ImageBackground
      source={coverPhoto ?? profilePicture ?? { uri: '' }}
      style={[rootCss, isEdit && borderRadiusStyle]}
    >
      {!profilePicture && !coverPhoto ? (
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.20)', 'rgba(0, 0, 0, 0.00)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{ height: '100%' }}
        />
      ) : null}
      {profilePicture && !coverPhoto ? (
        <View style={borderRadiusStyle}>
          <BlurView
            blurType='light'
            blurAmount={20}
            style={[{ height: '100%' }]}
          />
        </View>
      ) : null}
      {onSelectCoverPhoto ? (
        <IconImage
          style={{ position: 'absolute', top: spacing.m, right: spacing.m }}
          color='staticWhite'
          onPress={onSelectCoverPhoto}
        />
      ) : null}
    </ImageBackground>
  )
}

type ProfilePictureProps = {
  profilePicture?: ImageURISource
  onSelectProfilePicture?: () => void
}

export const ProfilePicture = (props: ProfilePictureProps) => {
  const { profilePicture, onSelectProfilePicture } = props

  return (
    <Avatar
      accessibilityLabel='Profile Picture'
      size='xl'
      variant='strong'
      source={profilePicture ?? { uri: '' }}
    >
      {onSelectProfilePicture ? (
        <IconCamera
          size='2xl'
          color='staticWhite'
          onPress={onSelectProfilePicture}
        />
      ) : null}
    </Avatar>
  )
}

type AccountDetailsProps = {
  displayName?: string
  handle?: string
  isVerified?: boolean
  emphasis: boolean
}

const AccountDetails = (props: AccountDetailsProps) => {
  const { displayName, handle, isVerified, emphasis } = props
  const shadow = emphasis ? 'emphasis' : undefined
  return (
    <Flex>
      <Text
        variant='heading'
        size='s'
        strength='strong'
        color='staticWhite'
        shadow={shadow}
      >
        {displayName || ' '}
      </Text>
      <Flex>
        <Text variant='title' size='s' color='staticWhite' shadow={shadow}>
          @{handle}
        </Text>
        {isVerified ? <IconVerified size='s' /> : null}
      </Flex>
    </Flex>
  )
}
