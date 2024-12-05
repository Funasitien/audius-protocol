import { useImageSize } from '@audius/common/hooks'
import type { SquareSizes, ID } from '@audius/common/models'
import {
  cacheTracksSelectors,
  reachabilitySelectors
} from '@audius/common/store'
import type { Maybe } from '@audius/common/utils'
import { useSelector } from 'react-redux'

import type {
  CornerRadiusOptions,
  FastImageProps
} from '@audius/harmony-native'
import { FastImage, preload, useTheme } from '@audius/harmony-native'
import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { getLocalTrackCoverArtPath } from 'app/services/offline-downloader'
import { getTrackDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

import { primitiveToImageSource } from './primitiveToImageSource'

const { getTrack } = cacheTracksSelectors
const { getIsReachable } = reachabilitySelectors

const useLocalTrackImageUri = (trackId: Maybe<ID>) => {
  const trackImageUri = useSelector((state) => {
    if (!trackId) return null

    const isReachable = getIsReachable(state)
    if (isReachable) return null

    const trackDownloadStatus = getTrackDownloadStatus(state, trackId)
    const isDownloaded = trackDownloadStatus === OfflineDownloadStatus.SUCCESS
    if (!isDownloaded) return null

    return `file://${getLocalTrackCoverArtPath(trackId.toString())}`
  })

  return primitiveToImageSource(trackImageUri)
}

export const useTrackImage = ({
  trackId,
  size
}: {
  trackId?: ID
  size: SquareSizes
}) => {
  const artwork = useSelector(
    (state) => getTrack(state, { id: trackId })?.artwork
  )
  const image = useImageSize({
    artwork,
    targetSize: size,
    defaultImage: '',
    preloadImageFn: async (url: string) => {
      preload([{ uri: url }])
    }
  })

  if (image === '') {
    return {
      source: imageEmpty,
      isFallbackImage: true
    }
  }

  // Return edited artwork from this session, if it exists
  // TODO(PAY-3588) Update field once we've switched to another property name
  // for local changes to artwork
  // @ts-ignore
  if (artwork?.url) {
    return {
      // @ts-ignore
      source: primitiveToImageSource(artwork.url),
      isFallbackImage: false
    }
  }

  return {
    source: primitiveToImageSource(image),
    isFallbackImage: false
  }
}

type TrackImageProps = {
  trackId?: ID
  size: SquareSizes
  style?: FastImageProps['style']
  borderRadius?: CornerRadiusOptions
  onLoad?: FastImageProps['onLoad']
  children?: React.ReactNode
}

export const TrackImage = (props: TrackImageProps) => {
  const {
    trackId,
    size,
    style,
    borderRadius = 's' as const,
    onLoad,
    ...other
  } = props

  const localTrackImageUri = useLocalTrackImageUri(trackId)
  const trackImageSource = useTrackImage({ trackId, size })
  const { color, cornerRadius } = useTheme()
  const { source, isFallbackImage } = trackImageSource

  if (!source && !localTrackImageUri) return null

  return (
    <FastImage
      {...other}
      style={[
        { aspectRatio: 1, borderRadius: cornerRadius[borderRadius] },
        isFallbackImage && { backgroundColor: color.background.surface2 },
        style
      ]}
      source={source ?? localTrackImageUri!}
      onLoad={onLoad}
    />
  )
}
