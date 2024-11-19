import { useDownloadableContentAccess } from '@audius/common/hooks'
import {
  ID,
  StemCategory,
  stemCategoryFriendlyNames
} from '@audius/common/models'
import {
  cacheTracksSelectors,
  cacheUsersSelectors,
  CommonState
} from '@audius/common/store'
import { getFilename, formatBytes } from '@audius/common/utils'
import { Flex, IconButton, IconReceive, Text } from '@audius/harmony'
import { shallowEqual, useSelector } from 'react-redux'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import Tooltip from 'components/tooltip/Tooltip'
import { useIsMobile } from 'hooks/useIsMobile'

import styles from './DownloadRow.module.css'

const { getTrack } = cacheTracksSelectors
const { getUser } = cacheUsersSelectors

const messages = {
  fullTrack: 'Full Track',
  followToDownload: 'Must follow artist to download.',
  download: 'Download Stem'
}

type DownloadRowProps = {
  onDownload: (args: { trackIds: ID[]; parentTrackId?: ID }) => void
  trackId?: ID
  parentTrackId?: ID
  hideDownload?: boolean
  index: number
  size?: number
  category?: StemCategory
  filename?: string
  isLoading?: boolean
}

export const DownloadRow = ({
  onDownload,
  trackId,
  parentTrackId,
  hideDownload,
  index,
  size,
  category,
  filename,
  isLoading
}: DownloadRowProps) => {
  const isMobile = useIsMobile()
  const track = useSelector(
    (state: CommonState) => getTrack(state, { id: trackId }),
    shallowEqual
  )
  const user = useSelector(
    (state: CommonState) => getUser(state, { id: track?.owner_id }),
    shallowEqual
  )
  const downloadableContentAccess = useDownloadableContentAccess({
    trackId: parentTrackId ?? trackId ?? 0
  })
  const { shouldDisplayDownloadFollowGated } = parentTrackId
    ? downloadableContentAccess
    : { shouldDisplayDownloadFollowGated: false }

  const downloadButton = () => (
    <IconButton
      icon={IconReceive}
      size='s'
      aria-label={messages.download}
      color='default'
      onClick={() =>
        onDownload({
          trackIds: trackId ? [trackId] : []
        })
      }
      disabled={shouldDisplayDownloadFollowGated}
    />
  )

  return (
    <Flex
      p='l'
      borderTop='default'
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      w='100%'
      gap='xs'
      role='row'
    >
      <Flex gap='xl' alignItems='center' w='100%' css={{ overflow: 'hidden' }}>
        <Text variant='body' color='subdued'>
          {index}
        </Text>
        <Flex direction='column' gap='xs' css={{ overflow: 'hidden' }} w='100%'>
          <Text variant='body' strength='default'>
            {category
              ? stemCategoryFriendlyNames[category]
              : track?.stem_of?.category
              ? stemCategoryFriendlyNames[track?.stem_of?.category]
              : messages.fullTrack}
          </Text>
          <Text
            variant='body'
            color='subdued'
            css={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {filename ??
              (track && user
                ? getFilename({
                    track,
                    user,
                    isOriginal: true
                  })
                : null)}
          </Text>
        </Flex>
      </Flex>
      <Flex gap='2xl'>
        {size && !isMobile ? (
          <Text
            variant='body'
            size='s'
            color='subdued'
            css={{
              whiteSpace: 'nowrap'
            }}
          >
            {formatBytes(size)}
          </Text>
        ) : null}
        {hideDownload ? null : (
          <>
            {shouldDisplayDownloadFollowGated ? (
              <Tooltip
                text={messages.followToDownload}
                placement='left'
                mouseEnterDelay={0}
              >
                {/* Need wrapping flex for the tooltip to appear for some reason */}
                <Flex>{downloadButton()}</Flex>
              </Tooltip>
            ) : isLoading ? (
              <LoadingSpinner className={styles.spinner} />
            ) : (
              downloadButton()
            )}
          </>
        )}
      </Flex>
    </Flex>
  )
}
