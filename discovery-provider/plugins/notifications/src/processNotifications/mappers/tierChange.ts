import { Knex } from 'knex'
import { NotificationRow, UserRow } from '../../types/dn'
import { TierChangeNotification } from '../../types/notifications'
import { BaseNotification, Device, NotificationSettings } from './base'
import { sendPushNotification } from '../../sns'
import { ResourceIds, Resources } from '../../email/appNotifications/renderEmail'
import { EntityType } from '../../email/appNotifications/types'

type TierChangeNotificationRow = Omit<NotificationRow, 'data'> & { data: TierChangeNotification }
export class TierChange extends BaseNotification<TierChangeNotificationRow> {

  newTier: number
  receiverUserId: number
  rank: number

  constructor(dnDB: Knex, identityDB: Knex, notification: TierChangeNotificationRow) {
    super(dnDB, identityDB, notification)
    const userIds: number[] = this.notification.user_ids!
    this.receiverUserId = userIds[0]
  }

  async pushNotification() {

    const res: Array<{ user_id: number, name: string, is_deactivated: boolean }> = await this.dnDB.select('user_id', 'name', 'is_deactivated')
      .from<UserRow>('users')
      .where('is_current', true)
      .whereIn('user_id', [this.receiverUserId])
    const users = res.reduce((acc, user) => {
      acc[user.user_id] = { name: user.name, isDeactivated: user.is_deactivated }
      return acc
    }, {} as Record<number, { name: string, isDeactivated: boolean }>)


    if (users?.[this.receiverUserId]?.isDeactivated) {
      return
    }

    // Get the user's notification setting from identity service
    const userNotifications = await super.getShouldSendNotification(this.receiverUserId)

    // If the user has devices to the notification to, proceed
    if ((userNotifications.mobile?.[this.receiverUserId]?.devices ?? []).length > 0) {
      const userMobileSettings: NotificationSettings = userNotifications.mobile?.[this.receiverUserId].settings
      const devices: Device[] = userNotifications.mobile?.[this.receiverUserId].devices
      // If the user's settings for the follow notification is set to true, proceed
      await Promise.all(devices.map(device => {
        return sendPushNotification({
          type: device.type,
          badgeCount: userNotifications.mobile[this.receiverUserId].badgeCount,
          targetARN: device.awsARN
        }, {
          title: 'Favorite',
          body: ``,
          data: {}
        })
      }))
      // TODO: increment badge count

    }
    // 

    if (userNotifications.browser) {
      // TODO: Send out browser

    }
    if (userNotifications.email) {
      // TODO: Send out email
    }

  }

  getResourcesForEmail(): ResourceIds {
    return {
      users: new Set([this.receiverUserId]),
    }
  }

  formatEmailProps(resources: Resources) {
    const sendingUser = resources.users[this.receiverUserId]
    return {
      type: this.notification.type,
      sendingUser: { name: sendingUser.name },
      rank: this.rank
    }
  }

}
