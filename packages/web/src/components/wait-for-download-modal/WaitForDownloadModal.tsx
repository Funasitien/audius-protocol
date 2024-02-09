import { useCallback } from 'react'

import { DownloadQuality } from '@audius/common/models'
import {
  CommonState,
  useWaitForDownloadModal,
  cacheTracksSelectors,
  tracksSocialActions
} from '@audius/common/store'
import { getDownloadFilename } from '@audius/common/utils'
import { Flex, IconReceive, Text } from '@audius/harmony'
import { ModalHeader } from '@audius/stems'
import cn from 'classnames'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import { Icon } from 'components/Icon'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { useIsMobile } from 'hooks/useIsMobile'
import ModalDrawer from 'pages/audio-rewards-page/components/modals/ModalDrawer'

import styles from './WaitForDownloadModal.module.css'

const { getTrack } = cacheTracksSelectors

const messages = {
  title: 'Downloading...'
}

export const WaitForDownloadModal = () => {
  const isMobile = useIsMobile()
  const {
    isOpen,
    onClose,
    onClosed,
    data: { parentTrackId, trackIds, quality }
  } = useWaitForDownloadModal()
  const dispatch = useDispatch()
  const track = useSelector(
    (state: CommonState) =>
      getTrack(state, { id: parentTrackId ?? trackIds[0] }),
    shallowEqual
  )

  const handleClosed = useCallback(() => {
    dispatch(tracksSocialActions.cancelDownloads())
    onClosed()
  }, [onClosed, dispatch])

  const trackName =
    !parentTrackId && track?.orig_filename && track?.orig_filename?.length > 0
      ? getDownloadFilename({
          filename: track.orig_filename,
          isOriginal: quality === DownloadQuality.ORIGINAL
        })
      : track?.title

  return (
    <ModalDrawer
      isOpen={isOpen}
      onClose={onClose}
      onClosed={handleClosed}
      bodyClassName={styles.modal}
      isFullscreen
      useGradientTitle={false}
      dismissOnClickOutside
      wrapperClassName={isMobile ? styles.mobileWrapper : undefined}
    >
      <ModalHeader
        onClose={onClose}
        showDismissButton={!isMobile}
        className={cn(styles.modalHeader, { [styles.mobile]: isMobile })}
      >
        <Flex justifyContent='center' gap='s'>
          <Icon size='large' icon={IconReceive} />
          <Text variant='label' size='xl' strength='strong'>
            {messages.title}
          </Text>
        </Flex>
      </ModalHeader>
      <Flex direction='column' p='xl' gap='xl' alignItems='center'>
        <Text variant='body' size='l' strength='strong'>
          {trackName}
        </Text>
        <LoadingSpinner className={styles.spinner} />
      </Flex>
    </ModalDrawer>
  )
}
