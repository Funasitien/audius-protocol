import type { ID, DownloadQuality } from '@audius/common/models'
import type { CommonState } from '@audius/common/store'
import { cacheTracksSelectors } from '@audius/common/store'
import { css } from '@emotion/native'
import { useSelector } from 'react-redux'

import { Flex, Text, IconReceive, Box } from '@audius/harmony-native'
import { PlainButton } from 'app/harmony-native/components/Button/PlainButton/PlainButton'

const { getTrack } = cacheTracksSelectors

const messages = {
  fullTrack: 'Full Track',
  followToDownload: 'Must follow artist to download.'
}

type DownloadRowProps = {
  trackId: ID
  parentTrackId?: ID
  quality: DownloadQuality
  hideDownload?: boolean
  index: number
  onDownload: (args: { trackIds: ID[]; parentTrackId?: ID }) => void
}

export const DownloadRow = ({
  trackId,
  parentTrackId,
  quality,
  hideDownload,
  index,
  onDownload
}: DownloadRowProps) => {
  const track = useSelector((state: CommonState) =>
    getTrack(state, { id: trackId })
  )

  return (
    <Flex
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      borderTop='default'
      pv='m'
      ph='l'
    >
      <Flex
        direction='row'
        gap='xl'
        alignItems='center'
        justifyContent='space-between'
        style={css({ flexShrink: 1 })}
      >
        <Text variant='body' color='subdued'>
          {index}
        </Text>
        <Flex gap='xs' style={css({ flexShrink: 1 })}>
          <Text variant='body'>
            {track?.stem_of?.category ?? messages.fullTrack}
          </Text>
          <Text
            variant='body'
            color='subdued'
            ellipsizeMode='tail'
            numberOfLines={1}
          >
            {track?.orig_filename}
          </Text>
        </Flex>
      </Flex>
      {hideDownload ? null : (
        <PlainButton onPress={() => onDownload({ trackIds: [trackId] })}>
          <Box ph='s' pv='m'>
            <IconReceive color='subdued' size='s' />
          </Box>
        </PlainButton>
      )}
    </Flex>
  )
}
