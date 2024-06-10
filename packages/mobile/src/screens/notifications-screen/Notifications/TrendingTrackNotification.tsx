import { useCallback } from 'react'

import { Name } from '@audius/common/models'
import type {
  TrackEntity,
  TrendingTrackNotification as TrendingTrackNotificationType
} from '@audius/common/store'
import { notificationsSelectors } from '@audius/common/store'
import type { Nullable } from '@audius/common/utils'
import { useSelector } from 'react-redux'

import { IconTrending } from '@audius/harmony-native'
import { useNotificationNavigation } from 'app/hooks/useNotificationNavigation'

import {
  EntityLink,
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle,
  NotificationTwitterButton
} from '../Notification'
const { getNotificationEntity } = notificationsSelectors

const messages = {
  title: "You're Trending",
  is: 'is',
  trending: 'on Trending right now!',
  twitterShareText: (entityTitle: string) =>
    `My track ${entityTitle} is trending on @audius! Check it out! #Audius #AudiusTrending $AUDIO`
}

type TrendingTrackNotificationProps = {
  notification: TrendingTrackNotificationType
}

export const TrendingTrackNotification = (
  props: TrendingTrackNotificationProps
) => {
  const { notification } = props
  const { rank } = notification

  const track = useSelector((state) =>
    getNotificationEntity(state, notification)
  ) as Nullable<TrackEntity>

  const navigation = useNotificationNavigation()

  const handlePress = useCallback(() => {
    if (track) {
      navigation.navigate(notification)
    }
  }, [navigation, notification, track])

  if (!track) return null

  const shareText = messages.twitterShareText(track.title)

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconTrending}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationText>
        <EntityLink entity={track} /> {messages.is} #{rank} {messages.trending}
      </NotificationText>
      <NotificationTwitterButton
        type='static'
        shareText={shareText}
        analytics={{
          eventName: Name.NOTIFICATIONS_CLICK_TRENDING_TRACK_TWITTER_SHARE,
          text: shareText
        }}
      />
    </NotificationTile>
  )
}
