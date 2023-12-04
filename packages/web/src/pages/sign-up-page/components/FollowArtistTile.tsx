import { HTMLProps, useContext } from 'react'

import { UserMetadata, WidthSizes } from '@audius/common'
import {
  Box,
  Divider,
  Flex,
  FollowButton,
  IconNote,
  IconPause,
  IconPlay,
  IconSoundwave,
  IconUser,
  IconVerified,
  Paper,
  Text,
  useTheme
} from '@audius/harmony'
import { useField } from 'formik'
import { useHover } from 'react-use'

import { Avatar } from 'components/avatar/Avatar'
import { useCoverPhoto } from 'hooks/useCoverPhoto'
import { useMedia } from 'hooks/useMedia'

import { SelectArtistsPreviewContext } from '../utils/selectArtistsPreviewContext'

type FollowArtistTileProps = {
  user: UserMetadata
} & HTMLProps<HTMLInputElement>

const FollowArtistTile = (props: FollowArtistTileProps) => {
  const {
    user: { name, user_id, is_verified, track_count, follower_count }
  } = props
  const { isMobile } = useMedia()
  const { source: coverPhoto, shouldBlur } = useCoverPhoto(
    user_id,
    WidthSizes.SIZE_640
  )
  const [followField] = useField({ name: 'selectedArtists', type: 'checkbox' })
  const { spacing, color } = useTheme()

  const {
    togglePreview,
    nowPlayingArtistId,
    isPlaying: isPreviewPlaying
  } = useContext(SelectArtistsPreviewContext)

  const isPlaying = isPreviewPlaying && nowPlayingArtistId === user_id

  const [avatar] = useHover((isHovered) => (
    <Box w={72} h={72} css={{ position: 'absolute', top: 34 }}>
      <Flex
        h={74}
        w={74}
        justifyContent='center'
        alignItems='center'
        css={{
          visibility: isHovered || isPlaying ? 'visible' : 'hidden',
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          borderRadius: 100,
          opacity: 0.75,
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.10) 100%)',
          zIndex: 2
        }}
      >
        {isPlaying ? (
          <IconPause size='l' color='staticWhite' />
        ) : (
          <Box pl='xs'>
            <IconPlay size='l' color='staticWhite' />
          </Box>
        )}
      </Flex>
      <Avatar
        variant='strong'
        userId={user_id}
        onClick={() => {
          togglePreview(user_id)
        }}
      />
    </Box>
  ))

  return (
    <Paper h={220} w={isMobile ? 'calc(50% - 4px)' : 235}>
      <Flex w='100%' direction='column' alignItems='center'>
        {isPlaying ? (
          <IconSoundwave
            css={{
              opacity: '60%',
              position: 'absolute',
              right: spacing.s,
              top: spacing.s,
              zIndex: 1,
              'g path': {
                fill: color.icon.staticWhite
              }
            }}
          />
        ) : null}
        {avatar}
        <Box
          w='100%'
          h={68}
          css={{
            backgroundImage: `url(${coverPhoto})`,
            backgroundSize: 'cover',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              ...(shouldBlur
                ? {
                    backdropFilter: 'blur(25px)'
                  }
                : undefined)
            },
            overflow: 'hidden'
          }}
        />
        <Flex
          direction='column'
          alignItems='center'
          gap='l'
          pt='3xl'
          pb='l'
          ph='s'
          w='100%'
        >
          <Flex direction='column' alignItems='center' gap='s'>
            <Flex direction='row' gap='xs' alignItems='center'>
              <Text
                variant='title'
                size='s'
                strength='default'
                css={{
                  // TODO: Need to contain width
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {name}
              </Text>
              {is_verified ? (
                <IconVerified css={{ width: 12, height: 12 }} />
              ) : null}
            </Flex>
            <Flex direction='row' gap='s' alignItems='center'>
              <Flex direction='row' gap='xs' alignItems='center'>
                <IconNote width={16} height={16} color='subdued' />
                <Text variant='body' size='s' strength='strong'>
                  {track_count}
                </Text>
              </Flex>
              <Divider orientation='vertical' />
              <Flex direction='row' gap='xs' alignItems='center'>
                <IconUser width={16} height={16} color='subdued' />
                <Text variant='body' size='s' strength='strong'>
                  {follower_count}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <FollowButton
            variant='pill'
            type='checkbox'
            size={isMobile ? 'small' : 'default'}
            {...followField}
            isFollowing={followField.value.includes(user_id.toString())}
            value={user_id}
          />
        </Flex>
      </Flex>
    </Paper>
  )
}

export default FollowArtistTile
