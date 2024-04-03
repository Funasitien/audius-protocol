import type { ReactNode } from 'react'
import { useState, useCallback } from 'react'

import type { Collectible, ID } from '@audius/common/models'
import {
  accountSelectors,
  collectibleDetailsUIActions,
  modalsActions
} from '@audius/common/store'
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native'
import { ImageBackground, Text, View } from 'react-native'
import { createThumbnail } from 'react-native-create-thumbnail'
import { SvgUri } from 'react-native-svg'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import { IconPlay } from '@audius/harmony-native'
import { ChainLogo, Tile } from 'app/components/core'
import { Skeleton } from 'app/components/skeleton'
import { makeStyles } from 'app/styles'

import { CollectiblesCardErrorBoundary } from './CollectiblesCardErrorBoundary'
const { setVisibility } = modalsActions
const { setCollectible } = collectibleDetailsUIActions
const getUserId = accountSelectors.getUserId

const useStyles = makeStyles(({ typography, palette, spacing }) => ({
  content: {
    padding: spacing(4)
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    color: palette.neutral,
    marginTop: spacing(4)
  },
  image: {
    overflow: 'hidden',
    paddingBottom: '100%',
    width: '100%',
    borderRadius: 8
  },
  iconPlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chain: {
    position: 'absolute',
    bottom: spacing(3),
    left: spacing(3)
  }
}))

type CollectiblesCardProps = {
  collectible: Collectible
  ownerId: ID
  style?: StyleProp<ViewStyle>
}

type CollectibleImageProps = {
  uri: string
  style: StyleProp<ImageStyle>
  children?: ReactNode
}

const CollectibleImage = (props: CollectibleImageProps) => {
  const { children, style, uri } = props

  const isUriNumber = typeof uri === 'number'
  const isSvg = isUriNumber ? false : !!uri.match(/.*\.svg$/)
  const isMp4 = isUriNumber ? false : !!uri.match(/.*\.mp4$/)

  const [size, setSize] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)

  const { value: mp4ThumbnailUrl } = useAsync(async () => {
    if (isMp4) {
      const response = await createThumbnail({
        url: uri,
        timeStamp: 10000
      })
      return response.path
    }
  }, [isMp4])

  return (
    <>
      {isSvg ? (
        <View
          onLayout={(e) => {
            setSize(e.nativeEvent.layout.width)
          }}
        >
          <SvgUri
            height={size}
            width={size}
            uri={uri}
            onLoad={() => setHasLoaded(true)}
            style={{ borderRadius: 8, overflow: 'hidden' }}
          >
            {hasLoaded ? (
              children
            ) : (
              <Skeleton
                width={'100%'}
                height={100}
                style={{ position: 'absolute', zIndex: 100 }}
              />
            )}
          </SvgUri>
        </View>
      ) : (
        <ImageBackground
          style={style}
          onLoad={() => setHasLoaded(true)}
          source={
            isUriNumber
              ? uri
              : {
                  uri: isMp4 ? mp4ThumbnailUrl : uri
                }
          }
        >
          {hasLoaded ? (
            children
          ) : (
            <Skeleton
              width={'100%'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />
          )}
        </ImageBackground>
      )}
    </>
  )
}

export const CollectiblesCard = (props: CollectiblesCardProps) => {
  const { collectible, style, ownerId } = props
  const { name, frameUrl, mediaType, gifUrl, videoUrl, chain } = collectible

  const styles = useStyles()

  const dispatch = useDispatch()
  const accountId = useSelector(getUserId)

  const handlePress = useCallback(() => {
    dispatch(
      setCollectible({
        collectible,
        ownerId,
        isUserOnTheirProfile: accountId === ownerId
      })
    )
    dispatch(setVisibility({ modal: 'CollectibleDetails', visible: true }))
  }, [dispatch, collectible, accountId, ownerId])

  const url = frameUrl ?? gifUrl ?? videoUrl

  return (
    <CollectiblesCardErrorBoundary>
      <Tile
        styles={{ root: style, content: styles.content }}
        onPress={handlePress}
      >
        {url ? (
          <CollectibleImage style={styles.image} uri={url}>
            {mediaType === 'VIDEO' ? (
              <View style={styles.iconPlay}>
                <IconPlay
                  size='3xl'
                  color='staticWhite'
                  style={{ opacity: 0.8 }}
                />
              </View>
            ) : null}
            <ChainLogo chain={chain} style={styles.chain} />
          </CollectibleImage>
        ) : null}
        <Text style={styles.title}>{name}</Text>
      </Tile>
    </CollectiblesCardErrorBoundary>
  )
}
