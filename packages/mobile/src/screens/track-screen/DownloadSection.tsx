import { useCallback, useState } from 'react'

import {
  DownloadQuality,
  ModalSource,
  cacheTracksSelectors,
  useCurrentStems,
  useDownloadableContentAccess,
  usePremiumContentPurchaseModal
} from '@audius/common'
import type { ID, CommonState } from '@audius/common'
import { USDC } from '@audius/fixed-decimal'
import { css } from '@emotion/native'
import { LayoutAnimation } from 'react-native'
import { useSelector } from 'react-redux'

import {
  Flex,
  IconReceive,
  Text,
  Button,
  IconLockUnlocked,
  useTheme
} from '@audius/harmony-native'
import { SegmentedControl } from 'app/components/core'
import { Expandable, ExpandableArrowIcon } from 'app/components/expandable'

import { DownloadRow } from './DownloadRow'

const { getTrack } = cacheTracksSelectors

const ORIGINAL_TRACK_INDEX = 1
const STEM_INDEX_OFFSET_WITHOUT_ORIGINAL_TRACK = 1
const STEM_INDEX_OFFSET_WITH_ORIGINAL_TRACK = 2

const messages = {
  title: 'Stems & Downloads',
  choose: 'Choose File Quality',
  mp3: 'MP3',
  original: 'Original',
  downloadAll: 'Download All',
  unlockAll: (price: string) => `Unlock All $${price}`,
  purchased: 'purchased'
}

export const DownloadSection = ({ trackId }: { trackId: ID }) => {
  const { color } = useTheme()
  const { onOpen: openPremiumContentPurchaseModal } =
    usePremiumContentPurchaseModal()
  const [quality, setQuality] = useState(DownloadQuality.MP3)
  const [isExpanded, setIsExpanded] = useState(false)
  const { stemTracks } = useCurrentStems({ trackId })
  const shouldDisplayDownloadAll = stemTracks.length > 1
  const {
    price,
    shouldDisplayPremiumDownloadLocked,
    shouldDisplayPremiumDownloadUnlocked
  } = useDownloadableContentAccess({ trackId })
  const track = useSelector((state: CommonState) =>
    getTrack(state, { id: trackId })
  )

  const onToggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(180, 'easeInEaseOut', 'opacity')
    )
    setIsExpanded((expanded) => !expanded)
  }, [])

  const handlePurchasePress = useCallback(() => {
    openPremiumContentPurchaseModal(
      { contentId: trackId },
      { source: ModalSource.TrackDetails }
    )
  }, [trackId, openPremiumContentPurchaseModal])

  const renderHeader = () => {
    return (
      <Flex
        p='l'
        direction='row'
        justifyContent='space-between'
        alignItems='center'
      >
        <Flex gap='m'>
          <Flex direction='row' alignItems='center' gap='s'>
            <IconReceive color='default' />
            <Text variant='label' size='l' strength='strong'>
              {messages.title}
            </Text>
          </Flex>
          {shouldDisplayPremiumDownloadLocked && price !== undefined ? (
            <Button
              variant='primary'
              size='small'
              color='lightGreen'
              onPress={handlePurchasePress}
            >
              {messages.unlockAll(
                USDC(price / 100).toLocaleString('en-us', {
                  roundingMode: 'floor',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              )}
            </Button>
          ) : shouldDisplayPremiumDownloadUnlocked ? (
            <>
              <Flex gap='s'>
                <Flex
                  borderRadius='3xl'
                  ph='s'
                  style={css({
                    backgroundColor: color.special.lightGreen,
                    paddingTop: 1,
                    paddingBottom: 1
                  })}
                >
                  <IconLockUnlocked color='staticWhite' size='xs' />
                </Flex>
                <Text
                  variant='label'
                  size='l'
                  strength='strong'
                  color='subdued'
                >
                  {messages.purchased}
                </Text>
              </Flex>
            </>
          ) : null}
        </Flex>
        <ExpandableArrowIcon expanded={isExpanded} />
      </Flex>
    )
  }

  const options = [
    {
      key: DownloadQuality.MP3,
      text: messages.mp3
    },
    {
      key: DownloadQuality.ORIGINAL,
      text: messages.original
    }
  ]

  return (
    <Flex border='default' borderRadius='m' mb='m'>
      <Expandable
        renderHeader={renderHeader}
        expanded={isExpanded}
        onToggleExpand={onToggleExpand}
      >
        {track?.is_original_available ? (
          <Flex p='l' borderTop='default' gap='l' alignItems='flex-start'>
            <Text variant='title'>{messages.choose}</Text>
            <SegmentedControl
              options={options}
              selected={quality}
              onSelectOption={(quality) => setQuality(quality)}
            />
          </Flex>
        ) : null}
        {track?.is_downloadable ? (
          <DownloadRow
            trackId={trackId}
            quality={quality}
            index={ORIGINAL_TRACK_INDEX}
          />
        ) : null}
        {stemTracks?.map((s, i) => (
          <DownloadRow
            trackId={s.id}
            key={s.id}
            index={
              i +
              (track?.is_downloadable
                ? STEM_INDEX_OFFSET_WITH_ORIGINAL_TRACK
                : STEM_INDEX_OFFSET_WITHOUT_ORIGINAL_TRACK)
            }
            quality={quality}
          />
        ))}
        {shouldDisplayDownloadAll ? (
          <Flex p='l' borderTop='default' justifyContent='center'>
            <Button variant='secondary' iconLeft={IconReceive} size='small'>
              {messages.downloadAll}
            </Button>
          </Flex>
        ) : null}
      </Expandable>
    </Flex>
  )
}
