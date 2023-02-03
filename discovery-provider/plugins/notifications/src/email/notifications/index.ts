import { Knex } from 'knex'
import moment from 'moment-timezone'
import { config } from '../../config'
import { EmailFrequency } from '../../processNotifications/mappers/base'
import { DMEmailNotification, EmailNotification } from '../../types/notifications'
import { DMEntityType } from './types'

import { logger } from '../../logger'
import { sendNotificationEmail } from './sendEmail'

// blockchainUserId => email
type EmailUsers = {
  [blockchainUserId: number]: string
}

type UserEmailNotification = {
  user: {
    blockchainUserId: number,
    email: string
  },
  notifications: EmailNotification[]
}

const DEFAULT_TIMEZONE = 'America/Los_Angeles'

const Results = Object.freeze({
  USER_TURNED_OFF: 'USER_TURNED_OFF',
  USER_BLOCKED: 'USER_BLOCKED',
  SHOULD_SKIP: 'SHOULD_SKIP',
  ERROR: 'ERROR',
  SENT: 'SENT'
})

const getUsersCanNotify = async (identityDb: Knex, frequency: EmailFrequency, startOffset: moment.Moment): Promise<EmailUsers>  => {
  const validLastEmailOffset = startOffset.subtract(2, 'hour')
  const userRows: { blockchainUserId: number, email: string }[] = await identityDb
    .select(
      'Users.blockchainUserId',
      'Users.email'
    )
    .from('Users')
    .join('UserNotificationSettings', 'UserNotificationSettings.userId', 'Users.blockchainUserId')
    .leftJoin('NotificationEmails', 'NotificationEmails.userId', 'Users.blockchainUserId')
    .where('Users.isEmailDeliverable', true)
    .where(function () {
      this.where('NotificationEmails', null).orWhere('NotificationEmails.timestamp', '<', validLastEmailOffset)
    })
    .where('UserNotificationSettings.emailFrequency', frequency)
  const emailUsers = userRows.reduce((acc, user) => {
    acc[user.blockchainUserId] = user.email
    return acc
  }, {} as EmailUsers)
  return emailUsers
}

const appNotificationsSql = `
WITH latest_user_seen AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    seen_at
  FROM
    notification_seen
  ORDER BY
    user_id,
    seen_at desc
)
SELECT
  n.*,
  latest_user_seen.user_id AS receiver_user_id
FROM (
  SELECT *
  FROM
      notification
  WHERE
    notification.timestamp > :start_offset AND
    notification.user_ids && (:user_ids)
) AS n
LEFT JOIN latest_user_seen ON latest_user_seen.user_id = ANY(n.user_ids)
WHERE
  latest_user_seen.seen_at is NULL OR
  latest_user_seen.seen_at < n.timestamp
`
// TODO group notifs if multiple
const messageNotificationsSql = `
WITH members_can_notify AS (
  SELECT user_id, chat_id
  FROM chat_member
  WHERE
    user_id = ANY(:user_ids) AND
    (last_active_at IS NULL OR last_active_at <= :start_offset)
)
SELECT
  chat_message.user_id AS sender_user_id,
  members_can_notify.user_id AS receiver_user_id
FROM chat_message
JOIN members_can_notify ON chat_message.chat_id = members_can_notify.chat_id
WHERE chat_message.created_at > :start_offset AND chat_message.created_at <= :end_offset AND chat_message.user_id != members_can_notify.user_id
`
const reactionNotificationsSql = `
WITH members_can_notify AS (
  SELECT user_id, chat_id
  FROM chat_member
  WHERE
    user_id = ANY(:user_ids) AND
    (last_active_at IS NULL OR last_active_at <= :start_offset)
)
SELECT
  chat_message_reactions.user_id AS sender_user_id,
  chat_message.user_id AS receiver_user_id
FROM chat_message_reactions
JOIN chat_message ON chat_message.message_id = chat_message_reactions.message_id
JOIN members_can_notify on members_can_notify.chat_id = chat_message.chat_id AND members_can_notify.user_id = chat_message.user_id
WHERE chat_message_reactions.updated_at > :start_offset AND chat_message_reactions.updated_at <= :end_offset AND chat_message_reactions.user_id != members_can_notify.user_id
`

const getNotifications = async (dnDb: Knex, startOffset: moment.Moment, userIds: string[]): Promise<EmailNotification[]> => {
  const appNotificationsResp = await dnDb.raw(appNotificationsSql, {
    start_offset: startOffset,
    user_ids: [[userIds]]
  })
  const appNotifications: EmailNotification[] = appNotificationsResp.rows

  const messageStartOffset = new Date(startOffset.valueOf() - config.dmNotificationDelay).toISOString()
  const messageEndOffset = new Date(Date.now() - config.dmNotificationDelay).toISOString()
  const messagesResp = await dnDb.raw(messageNotificationsSql, {
    start_offset: messageStartOffset,
    end_offset: messageEndOffset,
    user_ids: [[userIds]]
  })
  const messages: { sender_user_id: number, receiver_user_id: number }[] = messagesResp.rows
  const messageNotifications: DMEmailNotification[] = messages.map(n => ({
    type: DMEntityType.Message,
    sender_user_id: n.sender_user_id,
    receiver_user_id: n.receiver_user_id
  }))
  const reactionsResp = await dnDb.raw(reactionNotificationsSql, {
    start_offset: messageStartOffset,
    end_offset: messageEndOffset,
    user_ids: [[userIds]]
  })
  const reactions: { sender_user_id: number, receiver_user_id: number }[] = reactionsResp.rows
  const reactionNotifications: DMEmailNotification[] = reactions.map(n => ({
    type: DMEntityType.Reaction,
    sender_user_id: n.sender_user_id,
    receiver_user_id: n.receiver_user_id
  }))

  return appNotifications.concat(messageNotifications).concat(reactionNotifications)
}

const groupNotifications = (notifications: EmailNotification[], users: EmailUsers): UserEmailNotification[] => {
  const userNotifications: UserEmailNotification[] = []
  notifications.forEach(notification => {
    const userNotificationsIndex = userNotifications.findIndex(({ user }) => user.blockchainUserId == notification.receiver_user_id)
    if (userNotificationsIndex == -1) {
      // Add entry for user in userNotifications
      const userEmail = users[notification.receiver_user_id]
      if (userEmail) {
        userNotifications.push({
          user: {
            blockchainUserId: notification.receiver_user_id,
            email: users[notification.receiver_user_id]
          },
          notifications: [notification]
        })
      }
    } else {
      // Add to user's notification list in userNotifications
      userNotifications[userNotificationsIndex].notifications.push(notification)
    }
  })
  return userNotifications
}

export async function processEmailNotifications(dnDb: Knex, identityDb: Knex, frequency: EmailFrequency) {
  try {
    const now = moment()
    const days = 1
    const hours = 1
    const startOffset = now.clone().subtract(days, 'days').subtract(hours, 'hour')
    const users = await getUsersCanNotify(identityDb, frequency, startOffset)
    const notifications = await getNotifications(dnDb, startOffset, Object.keys(users))
    const groupedNotifications = groupNotifications(notifications, users)

    // Validate their timezones to send at the right time!

    const currentUtcTime = moment.utc()
    const chuckSize = 20
    const results = []
    for (let chunk = 0; chunk * chuckSize < notifications.length; chunk += 1) {
      const start = chunk * chuckSize
      const end = (chunk + 1) * chuckSize
      const chunkResults = await Promise.all(
        groupedNotifications.slice(start, end).map(async (userNotifications: UserEmailNotification) => {
          try {
            const user = userNotifications.user
            const notifications = userNotifications.notifications
            const sent = await sendNotificationEmail({
              userId: user.blockchainUserId,
              email: user.email,
              frequency,
              notifications: notifications,
              dnDb: dnDb
            })
            if (!sent) {
              // sent could be undefined, in which case there was no email sending failure, rather the user had 0 email notifications to be sent
              if (sent === false) {
                return { result: Results.ERROR, error: 'Unable to send email' }
              }
              return {
                result: Results.SHOULD_SKIP,
                error: 'No notifications to send in email'
              }
            }
            await identityDb.insert([{
              userId: user.blockchainUserId,
              emailFrequency: frequency,
              timestamp: currentUtcTime
            }]).into('NotificationEmail')
            return { result: Results.SENT }
          } catch (e) {
            return { result: Results.ERROR, error: e.toString() }
          }
        })
      )
      results.push(...chunkResults)
    }

    logger.info(
      {
        job: processEmailNotifications
      },
      `processEmailNotifications | time after looping over users to send notification email`
    )
  } catch (e) {
    logger.error(
      'processEmailNotifications | Error processing email notifications'
    )
    logger.error(e)
  }
}
