import { useImageSize } from '@audius/common/hooks'
import type { SquareSizes, ID } from '@audius/common/models'
import type { CommonState } from '@audius/common/store'
import {
  cacheCollectionsSelectors,
  reachabilitySelectors
} from '@audius/common/store'
import type { Maybe } from '@audius/common/utils'
import { useSelector } from 'react-redux'

import { FastImage, preload, useTheme } from '@audius/harmony-native'
import type { FastImageProps } from '@audius/harmony-native'
import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { getLocalCollectionCoverArtPath } from 'app/services/offline-downloader'
import { getCollectionDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

import { primitiveToImageSource } from './primitiveToImageSource'

const { getIsReachable } = reachabilitySelectors
const { getCollection } = cacheCollectionsSelectors

const useLocalCollectionImageUri = (collectionId: Maybe<ID>) => {
  const collectionImageUri = useSelector((state) => {
    if (!collectionId) return null

    const isReachable = getIsReachable(state)
    if (isReachable) return null

    const collectionDownloadStatus = getCollectionDownloadStatus(
      state,
      collectionId
    )
    const isDownloaded =
      collectionDownloadStatus === OfflineDownloadStatus.SUCCESS

    if (!isDownloaded) return null

    return `file://${getLocalCollectionCoverArtPath(collectionId.toString())}`
  })

  return primitiveToImageSource(collectionImageUri)
}

export const useCollectionImage = ({
  collectionId,
  size
}: {
  collectionId: Maybe<ID>
  size: SquareSizes
}) => {
  const artwork = useSelector(
    (state: CommonState) => getCollection(state, { id: collectionId })?.artwork
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

type CollectionImageProps = {
  collectionId: ID
  size: SquareSizes
  style?: FastImageProps['style']
  onLoad?: FastImageProps['onLoad']
  children?: React.ReactNode
}

export const CollectionImage = (props: CollectionImageProps) => {
  const { collectionId, size, style, onLoad, ...other } = props

  const localCollectionImageUri = useLocalCollectionImageUri(collectionId)
  const collectionImageSource = useCollectionImage({ collectionId, size })
  const { color, cornerRadius } = useTheme()
  const { source, isFallbackImage } = collectionImageSource

  if (!source && !localCollectionImageUri) return null

  return (
    <FastImage
      {...other}
      style={[
        { aspectRatio: 1, borderRadius: cornerRadius.s },
        isFallbackImage && { backgroundColor: color.background.surface2 },
        style
      ]}
      source={source ?? localCollectionImageUri!}
      onLoad={onLoad}
    />
  )
}
