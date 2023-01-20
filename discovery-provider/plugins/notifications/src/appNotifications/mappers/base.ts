import { Knex } from 'knex'
import { NotificationRow } from '../../types/dn'
import { sendAndroidMessage, sendIOSMessage } from '../../sns'


export type DeviceType = 'ios' | 'android'

export type EmailFrequency = 'off' | 'live' | 'daily' | 'weekly'

export type WebPush = {
  endpoint: string
  p256dhKey: string
  authKey: string
}
export type SafariPush = {
  type: string
  awsARN: string
  deviceToken: string
}
export type Browser = WebPush | SafariPush

export type Device = {
  type: DeviceType
  awsARN: string
  deviceToken: string
}

type UserBrowserSettings = {
  [userId: number]: {
    'settings': {
      'favorites': boolean
      'milestonesAndAchievements': boolean
      'reposts': boolean
      'announcements': boolean
      'followers': boolean
      'remixes': boolean
    },
    browser: Browser[]
  }
}
type UserMobileSettings = {
  [userId: number]: {
    'settings': {
      'favorites': boolean
      'milestonesAndAchievements': boolean
      'reposts': boolean
      'announcements': boolean
      'followers': boolean
      'remixes': boolean
    },
    badgeCount: number,
    devices: Device[]
  }
}

export abstract class BaseNotification {
  notification: NotificationRow
  dnDB: Knex
  identityDB: Knex

  constructor(dnDB: Knex, identityDB: Knex, notification: NotificationRow) {
    this.notification = notification
    this.dnDB = dnDB
    this.identityDB = identityDB
  }

  abstract pushNotification(): Promise<void>
  /**
   * Fetches the user's mobile push notification settings
   * 
   * @param userIds User ids to fetch notification settings
   * @returns 
   */
  async getUserMobileNotificationSettings(userIds: number[]): Promise<UserMobileSettings> {

    const userNotifSettingsMobile: Array<{
      userId: number
      favorites: boolean
      milestonesAndAchievements: boolean
      reposts: boolean
      announcements: boolean
      followers: boolean
      remixes: boolean
      deviceType: string
      awsARN: string
      deviceToken: string
      iosBadgeCount: number | null
    }> = await this.identityDB
      .select(
        'UserNotificationMobileSettings.userId',
        'UserNotificationMobileSettings.favorites',
        'UserNotificationMobileSettings.milestonesAndAchievements',
        'UserNotificationMobileSettings.reposts',
        'UserNotificationMobileSettings.announcements',
        'UserNotificationMobileSettings.followers',
        'UserNotificationMobileSettings.remixes',
        'NotificationDeviceTokens.deviceType',
        'NotificationDeviceTokens.awsARN',
        'NotificationDeviceTokens.deviceToken',
        'PushNotificationBadgeCounts.iosBadgeCount'
      )
      .from("UserNotificationMobileSettings")
      .innerJoin('NotificationDeviceTokens', 'NotificationDeviceTokens.userId', '=', 'UserNotificationMobileSettings.userId')
      .leftJoin('PushNotificationBadgeCounts', 'PushNotificationBadgeCounts.userId', '=', 'UserNotificationMobileSettings.userId')
      .whereIn("UserNotificationMobileSettings.userId", userIds)
      .andWhere("NotificationDeviceTokens.enabled", '=', true)
      .whereIn("NotificationDeviceTokens.deviceType", ['ios', 'android'])

    const userMobileSettings = userNotifSettingsMobile.reduce((acc, setting) => {
      acc[setting.userId] = {
        'settings': {
          'favorites': setting.favorites,
          'milestonesAndAchievements': setting.milestonesAndAchievements,
          'reposts': setting.reposts,
          'announcements': setting.announcements,
          'followers': setting.followers,
          'remixes': setting.remixes,
        },
        devices: [
          ...(acc?.[setting.userId]?.devices ?? []),
          {
            type: setting.deviceType,
            awsARN: setting.awsARN,
            deviceToken: setting.deviceToken,
          }
        ],
        badgeCount: setting.iosBadgeCount || 0
      }
      return acc
    }, {})
    return userMobileSettings
  }


  /**
   * Fetches the user's mobile push notification settings
   * 
   * @param userIds User ids to fetch notification settings
   * @returns 
   */
  async getUserEmailSettings(userIds: number[], frequency?: EmailFrequency) {

    const userNotifSettings: Array<{
      userId: number,
      emailFrequency: EmailFrequency
    }> = await this.identityDB
      .select(
        'UserNotificationSettings.userId',
        'UserNotificationSettings.emailFrequency',
      )
      .from("UserNotificationSettings")
      .whereIn("UserNotificationSettings.userId", userIds)
      .modify((queryBuilder) => {
        if (frequency) {
          queryBuilder.where('emailFrequency', frequency);
        }
      })
    const userEmailSettings: { [userId: number]: EmailFrequency } = userNotifSettings.reduce((acc, user) => {
      acc[user.userId] = user.emailFrequency
      return acc
    }, {})
    return userEmailSettings
  }

  /**
   * Fetches the user's browser push notification settings
   * 
   * @param userIds User ids to fetch notification settings
   * @returns 
   */
  async getUserBrowserSettings(userIds: number[]): Promise<UserBrowserSettings> {

    const userNotifSettingsBrowser: Array<{
      userId: number
      favorites: boolean
      milestonesAndAchievements: boolean
      reposts: boolean
      announcements: boolean
      followers: boolean
      remixes: boolean
      deviceType?: string
      awsARN?: string
      deviceToken?: string
      endpoint?: string
      p256dhKey?: string
      authKey?: string
    }> = await this.identityDB
      .select(
        "UserNotificationBrowserSettings.userId",
        "UserNotificationBrowserSettings.favorites",
        "UserNotificationBrowserSettings.milestonesAndAchievements",
        "UserNotificationBrowserSettings.reposts",
        "UserNotificationBrowserSettings.announcements",
        "UserNotificationBrowserSettings.followers",
        "UserNotificationBrowserSettings.remixes",
        'NotificationDeviceTokens.deviceType', // Note safari switch to web push protocol last yr for safari 16+
        'NotificationDeviceTokens.awsARN', // so these fields are no longer necessary if we don't want to support 
        'NotificationDeviceTokens.deviceToken', // legacy safari push notifs
        'NotificationBrowserSubscriptions.endpoint',
        'NotificationBrowserSubscriptions.p256dhKey',
        'NotificationBrowserSubscriptions.authKey',
      )
      .from("UserNotificationBrowserSettings")
      .leftJoin('NotificationDeviceTokens', 'NotificationDeviceTokens.userId', 'UserNotificationBrowserSettings.userId')
      .leftJoin('NotificationBrowserSubscriptions', 'NotificationBrowserSubscriptions.userId', 'UserNotificationBrowserSettings.userId')
      .whereIn("UserNotificationBrowserSettings.userId", userIds)
      .whereIn("NotificationDeviceTokens.deviceType", ['safari'])
      .andWhere("NotificationDeviceTokens.enabled", true)
      .andWhere("NotificationBrowserSubscriptions.enabled", true)

    const userBrowserSettings = userNotifSettingsBrowser.reduce((acc, setting) => {
      const safariSettings = (setting.deviceType && setting.awsARN && setting.deviceToken) ?
        {
          'type': setting.deviceType,
          'awsARN': setting.awsARN,
          'deviceToken': setting.deviceToken,
        } : undefined

      const webPushSettings = (setting.endpoint && setting.p256dhKey && setting.authKey) ?
        {
          'endpoint': setting.endpoint,
          'p256dhKey': setting.p256dhKey,
          'authKey': setting.authKey,
        } : undefined
      if (!safariSettings && !webPushSettings) {
        return acc
      }

      acc[setting[0]] = {
        'settings': {
          'favorites': setting.favorites,
          'milestonesAndAchievements': setting.milestonesAndAchievements,
          'reposts': setting.reposts,
          'announcements': setting.announcements,
          'followers': setting.followers,
          'remixes': setting.remixes,
        },
        browser: (acc?.[setting[0]]?.devices ?? [])
      }
      if (safariSettings) {
        acc[setting[0]].browser.push(safariSettings)
      }
      if (webPushSettings) {
        acc[setting[0]].browser.push(webPushSettings)
      }
      return acc
    }, {})
    return userBrowserSettings
  }
}