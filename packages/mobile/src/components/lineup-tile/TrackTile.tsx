import { useCallback } from 'react'

import type { Track, User } from '@audius/common'
import {
  playerSelectors,
  PlaybackSource,
  FavoriteSource,
  RepostSource,
  ShareSource,
  FavoriteType,
  SquareSizes,
  accountSelectors,
  cacheTracksSelectors,
  cacheUsersSelectors,
  tracksSocialActions,
  OverflowAction,
  OverflowSource,
  mobileOverflowMenuUIActions,
  shareModalUIActions,
  RepostType
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import type { LineupItemProps } from 'app/components/lineup-tile/types'
import { useNavigation } from 'app/hooks/useNavigation'
import { useTrackCoverArt } from 'app/hooks/useTrackCoverArt'

import { LineupTile } from './LineupTile'
const { getUid } = playerSelectors
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { open: openOverflowMenu } = mobileOverflowMenuUIActions
const { repostTrack, saveTrack, undoRepostTrack, unsaveTrack } =
  tracksSocialActions
const { getUserFromTrack } = cacheUsersSelectors
const { getTrack } = cacheTracksSelectors
const getUserId = accountSelectors.getUserId

export const TrackTile = (props: LineupItemProps) => {
  const { uid } = props

  const track = useSelector((state) => getTrack(state, { uid }))

  const user = useSelector((state) => getUserFromTrack(state, { uid }))

  if (!track || !user) {
    console.warn('Track or user missing for TrackTile, preventing render')
    return null
  }

  if (track.is_delete || user?.is_deactivated) {
    return null
  }

  return <TrackTileComponent {...props} track={track} user={user} />
}

type TrackTileProps = LineupItemProps & {
  track: Track
  user: User
}

const TrackTileComponent = ({
  togglePlay,
  track,
  user,
  ...lineupTileProps
}: TrackTileProps) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const currentUserId = useSelector(getUserId)
  const playingUid = useSelector(getUid)
  const isPlayingUid = playingUid === lineupTileProps.uid

  const {
    _cover_art_sizes,
    duration,
    field_visibility,
    is_unlisted,
    has_current_user_reposted,
    has_current_user_saved,
    play_count,
    title,
    track_id
  } = track

  const currentScreen = navigation.getState().history?.[0]
  // @ts-expect-error -- history returning unknown[]
  const isOnArtistsTracksTab = currentScreen?.key.includes('Tracks')

  const { user_id } = user

  const isOwner = user_id === currentUserId

  const imageUrl = useTrackCoverArt({
    id: track_id,
    sizes: _cover_art_sizes,
    size: SquareSizes.SIZE_150_BY_150
  })

  const handlePress = useCallback(
    ({ isPlaying }) => {
      togglePlay({
        uid: lineupTileProps.uid,
        id: track_id,
        source: PlaybackSource.TRACK_TILE,
        isPlaying,
        isPlayingUid
      })
    },
    [togglePlay, lineupTileProps.uid, track_id, isPlayingUid]
  )

  const handlePressTitle = useCallback(() => {
    navigation.push('Track', { id: track_id })
  }, [navigation, track_id])

  const handlePressOverflow = useCallback(() => {
    if (track_id === undefined) {
      return
    }
    const overflowActions = [
      !isOwner
        ? has_current_user_reposted
          ? OverflowAction.UNREPOST
          : OverflowAction.REPOST
        : null,
      !isOwner
        ? has_current_user_saved
          ? OverflowAction.UNFAVORITE
          : OverflowAction.FAVORITE
        : null,
      OverflowAction.SHARE,
      OverflowAction.ADD_TO_PLAYLIST,
      OverflowAction.VIEW_TRACK_PAGE,
      isOnArtistsTracksTab ? null : OverflowAction.VIEW_ARTIST_PAGE
    ].filter(Boolean) as OverflowAction[]

    dispatch(
      openOverflowMenu({
        source: OverflowSource.TRACKS,
        id: track_id,
        overflowActions
      })
    )
  }, [
    track_id,
    dispatch,
    has_current_user_reposted,
    has_current_user_saved,
    isOwner,
    isOnArtistsTracksTab
  ])

  const handlePressShare = useCallback(() => {
    if (track_id === undefined) {
      return
    }
    dispatch(
      requestOpenShareModal({
        type: 'track',
        trackId: track_id,
        source: ShareSource.TILE
      })
    )
  }, [dispatch, track_id])

  const handlePressSave = useCallback(() => {
    if (track_id === undefined) {
      return
    }
    if (has_current_user_saved) {
      dispatch(unsaveTrack(track_id, FavoriteSource.TILE))
    } else {
      dispatch(saveTrack(track_id, FavoriteSource.TILE))
    }
  }, [track_id, dispatch, has_current_user_saved])

  const handlePressRepost = useCallback(() => {
    if (track_id === undefined) {
      return
    }
    if (has_current_user_reposted) {
      dispatch(undoRepostTrack(track_id, RepostSource.TILE))
    } else {
      dispatch(repostTrack(track_id, RepostSource.TILE))
    }
  }, [track_id, dispatch, has_current_user_reposted])

  const hideShare = field_visibility?.share === false
  const hidePlays = field_visibility?.play_count === false

  return (
    <LineupTile
      {...lineupTileProps}
      isPlayingUid={isPlayingUid}
      duration={duration}
      favoriteType={FavoriteType.TRACK}
      repostType={RepostType.TRACK}
      hideShare={hideShare}
      hidePlays={hidePlays}
      id={track_id}
      imageUrl={imageUrl}
      isUnlisted={is_unlisted}
      onPress={handlePress}
      onPressOverflow={handlePressOverflow}
      onPressRepost={handlePressRepost}
      onPressSave={handlePressSave}
      onPressShare={handlePressShare}
      onPressTitle={handlePressTitle}
      playCount={play_count}
      title={title}
      item={track}
      user={user}
    />
  )
}
