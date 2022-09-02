import type { AllTrackingEvents as CommonTrackingEvents } from '@audius/common'
import { Name as CommonEventNames } from '@audius/common'

enum MobileEventNames {
  NOTIFICATIONS_OPEN_PUSH_NOTIFICATION = 'Notifications: Open Push Notification'
}

export const EventNames = { ...CommonEventNames, ...MobileEventNames }

type NotificationsOpenPushNotification = {
  eventName: MobileEventNames.NOTIFICATIONS_OPEN_PUSH_NOTIFICATION
  title?: string
  body?: string
}

type MobileTrackingEvents = NotificationsOpenPushNotification

export type AllEvents = CommonTrackingEvents | MobileTrackingEvents

export type JsonMap = Record<string, unknown>

export type Track = {
  eventName: string
  properties?: JsonMap
}

export type Screen = {
  route: string
  properties?: JsonMap
}

export {
  PlaybackSource,
  ShareSource,
  RepostSource,
  FavoriteSource,
  FollowSource,
  CreatePlaylistSource
} from '@audius/common'
