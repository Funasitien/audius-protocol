import { useCallback } from 'react'

import { DownloadQuality } from '@audius/common/models'
import type { CommonState } from '@audius/common/store'
import {
  cacheTracksSelectors,
  tracksSocialActions,
  useWaitForDownloadModal
} from '@audius/common/store'
import { getDownloadFilename } from '@audius/common/utils'
import { css } from '@emotion/native'
import { useDispatch, useSelector } from 'react-redux'

import {
  Divider,
  IconReceive,
  Text,
  Flex,
  useTheme
} from '@audius/harmony-native'
import Drawer from 'app/components/drawer'

import LoadingSpinner from '../loading-spinner'
const { getTrack } = cacheTracksSelectors

const messages = {
  title: 'Downloading...'
}

export const WaitForDownloadDrawer = () => {
  const dispatch = useDispatch()
  const {
    data: { parentTrackId, trackIds, quality },
    isOpen,
    onClose,
    onClosed
  } = useWaitForDownloadModal()

  const { spacing } = useTheme()
  const track = useSelector((state: CommonState) =>
    getTrack(state, { id: parentTrackId ?? trackIds[0] })
  )
  const trackName =
    !parentTrackId && track?.orig_filename && track?.orig_filename?.length > 0
      ? getDownloadFilename({
          filename: track.orig_filename,
          isOriginal: quality === DownloadQuality.ORIGINAL
        })
      : track?.title

  const handleClosed = useCallback(() => {
    dispatch(tracksSocialActions.cancelDownloads())
    onClosed()
  }, [onClosed, dispatch])

  return (
    <Drawer isOpen={isOpen} onClose={onClose} onClosed={handleClosed}>
      <Flex p='xl' gap='xl' alignItems='center'>
        <Flex direction='row' gap='s' justifyContent='center'>
          <IconReceive color='default' />
          <Text
            variant='label'
            strength='strong'
            size='xl'
            color='default'
            style={css({ textTransform: 'uppercase' })}
          >
            {messages.title}
          </Text>
        </Flex>
        <Flex style={css({ width: '100%' })}>
          <Divider orientation='horizontal' />
        </Flex>
        <Flex>
          <Text variant='body' size='l' strength='strong'>
            {trackName}
          </Text>
        </Flex>
        <Flex>
          <LoadingSpinner
            style={{ width: spacing.unit7, height: spacing.unit7 }}
          />
        </Flex>
      </Flex>
    </Drawer>
  )
}
