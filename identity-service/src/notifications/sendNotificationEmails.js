const path = require('path')
const uuidv4 = require('uuid/v4')
const moment = require('moment-timezone')
const models = require('../models')
const { logger } = require('../logging')
const fs = require('fs')

const renderEmail = require('./renderEmail')
const getEmailNotifications = require('./fetchNotificationMetadata')
const emailCachePath = './emailCache'

const {
  notificationTypes,
  dayInHours,
  weekInHours
} = require('./constants')

// Mailgun object
let mg

async function processEmailNotifications (expressApp, audiusLibs) {
  try {
    logger.info(`${new Date()} - processEmailNotifications`)

    mg = expressApp.get('mailgun')
    if (mg === null) {
      logger.error('Mailgun not configured')
      return
    }

    let dailyEmailUsers = await models.UserNotificationSettings.findAll({
      attributes: ['userId'],
      where: { emailFrequency: 'daily' }
    }).map(x => x.userId)

    let weeklyEmailUsers = await models.UserNotificationSettings.findAll({
      attributes: ['userId'],
      where: { emailFrequency: 'weekly' }
    }).map(x => x.userId)

    logger.info(`processEmailNotifications - ${dailyEmailUsers.length} daily users, ${weeklyEmailUsers.length}`)
    let now = moment()
    let dayAgo = now.clone().subtract(1, 'days')
    let weekAgo = now.clone().subtract(7, 'days')

    let appAnnouncements = expressApp.get('announcements')
    // For each announcement, we generate a list of valid users
    // Based on the user's email frequency
    let dailyUsersWithPendingAnnouncements = []
    let weeklyUsersWithPendingAnnouncements = []
    let currentTime = moment.utc()
    for (var announcement of appAnnouncements) {
      let announcementDate = moment(announcement['datePublished'])
      let timeSinceAnnouncement = moment.duration(currentTime.diff(announcementDate)).asHours()
      let announcementEntityId = announcement['entityId']
      let id = announcement['id']
      let usersCreatedAfterAnnouncement = await models.User.findAll({
        attributes: ['blockchainUserId'],
        where: {
          createdAt: { [models.Sequelize.Op.lt]: moment(announcementDate) }
        }
      }).map(x => x.blockchainUserId)

      for (var user of usersCreatedAfterAnnouncement) {
        let userNotificationQuery = await models.Notification.findOne({
          where: {
            isViewed: true,
            userId: user,
            type: notificationTypes.Announcement,
            entityId: announcementEntityId
          }
        })
        if (userNotificationQuery) {
          continue
        }
        if (dailyEmailUsers.includes(user)) {
          if (timeSinceAnnouncement < (dayInHours * 1.5)) {
            logger.info(`Announcements - ${id} | Daily user ${user}, <1 day`)
            dailyUsersWithPendingAnnouncements.append(user)
          }
        } else if (weeklyEmailUsers.includes(user)) {
          if (timeSinceAnnouncement < (weekInHours * 1.5)) {
            logger.info(`Announcements - ${id} | Weekly user ${user}, <1 week`)
            weeklyUsersWithPendingAnnouncements.append(user)
          }
        }
      }
    }
    let pendingNotificationUsers = new Set()
    // Add users with pending announcement notifications
    dailyUsersWithPendingAnnouncements.forEach(
      item => pendingNotificationUsers.add(item))
    weeklyUsersWithPendingAnnouncements.forEach(
      item => pendingNotificationUsers.add(item))

    // Query users with pending notifications grouped by frequency
    let dailyEmailUsersWithUnseeenNotifications = await models.Notification.findAll({
      attributes: ['userId'],
      where: {
        isViewed: false,
        userId: { [models.Sequelize.Op.in]: dailyEmailUsers },
        timestamp: { [models.Sequelize.Op.gt]: dayAgo }
      },
      group: ['userId']
    }).map(x => x.userId)
    dailyEmailUsersWithUnseeenNotifications.forEach(item => pendingNotificationUsers.add(item))

    let weeklyEmailUsersWithUnseeenNotifications = await models.Notification.findAll({
      attributes: ['userId'],
      where: {
        isViewed: false,
        userId: { [models.Sequelize.Op.in]: weeklyEmailUsers },
        timestamp: { [models.Sequelize.Op.gt]: weekAgo }
      },
      group: ['userId']
    }).map(x => x.userId)
    weeklyEmailUsersWithUnseeenNotifications.forEach(item => pendingNotificationUsers.add(item))
    logger.info(`Daily Email Users: ${dailyEmailUsersWithUnseeenNotifications}`)
    logger.info(`Weekly Email Users: ${weeklyEmailUsersWithUnseeenNotifications}`)

    // All users with notifications, including announcements
    let allUsersWithUnseenNotifications = [...pendingNotificationUsers]
    logger.info(`All Pending Email Users: ${allUsersWithUnseenNotifications}`)

    let userInfo = await models.User.findAll({
      where: {
        blockchainUserId: {
          [models.Sequelize.Op.in]: allUsersWithUnseenNotifications
        }
      }
    })

    // For every user with pending notifications, check if they are in the right timezone
    for (let userToEmail of userInfo) {
      let userEmail = userToEmail.email
      let userId = userToEmail.blockchainUserId
      let timezone = userToEmail.timezone
      if (!timezone) {
        timezone = 'America/Los_Angeles'
      }
      let userSettings = await models.UserNotificationSettings.findOrCreate(
        { where: { userId } }
      )
      let frequency = userSettings[0].emailFrequency
      if (frequency === 'off') {
        logger.info(`Bypassing email for user ${userId}`)
        continue
      }
      let currentUtcTime = moment.utc()
      let userTime = currentUtcTime.tz(timezone)
      let startOfUserDay = userTime.clone().startOf('day')
      let difference = moment.duration(userTime.diff(startOfUserDay)).asHours()

      // Based on this difference, schedule email for users
      // In prod, this difference must be <1 hour or between midnight - 1am
      let maxHourDifference = 2 // 1.5
      // Valid time found
      if (difference < maxHourDifference) {
        logger.info(`Valid email period for user ${userId}, ${timezone}, ${difference} hrs since startOfDay`)
        let latestUserEmail = await models.NotificationEmail.findOne({
          where: {
            userId
          },
          order: [['timestamp', 'DESC']]
        })
        if (!latestUserEmail) {
          let sent = await renderAndSendEmail(
            userId,
            userEmail,
            appAnnouncements,
            frequency,
            frequency === 'daily' ? dayAgo : weekAgo,
            audiusLibs
          )
          if (!sent) { continue }
          logger.info(`First email for ${userId}, ${frequency}, ${currentUtcTime}`)
          await models.NotificationEmail.create({
            userId,
            emailFrequency: frequency,
            timestamp: currentUtcTime
          })
        } else {
          let lastSentTimestamp = moment(latestUserEmail.timestamp)
          let timeSinceEmail = moment.duration(currentUtcTime.diff(lastSentTimestamp)).asHours()
          if (frequency === 'daily') {
            // If 1 day has passed, send email
            if (timeSinceEmail >= (dayInHours - 1)) {
              logger.info(`Daily email to ${userId}, last email from ${lastSentTimestamp}`)
              // Render email
              let sent = await renderAndSendEmail(
                userId,
                userEmail,
                appAnnouncements,
                frequency,
                dayAgo,
                audiusLibs
              )
              if (!sent) { continue }

              await models.NotificationEmail.create({
                userId,
                emailFrequency: frequency,
                timestamp: currentUtcTime
              })
            }
          } else if (frequency === 'weekly') {
            // If ~1 week has passed, send email
            if (timeSinceEmail >= (weekInHours - 1)) {
              logger.info(`Weekly email to ${userId}, last email from ${lastSentTimestamp}`)
              // Render email
              let sent = await renderAndSendEmail(
                userId,
                userEmail,
                appAnnouncements,
                frequency,
                weekAgo,
                audiusLibs
              )
              if (!sent) { continue }
              await models.NotificationEmail.create({
                userId,
                emailFrequency: frequency,
                timestamp: currentUtcTime
              })
            }
          }
        }
      }
    }
  } catch (e) {
    logger.error('Error processing email notifications')
    logger.error(e)
  }
}

// Master function to render and send email for a given userId
async function renderAndSendEmail (
  userId,
  userEmail,
  announcements,
  frequency,
  startTime,
  audiusLibs
) {
  try {
    logger.info(`renderAndSendEmail ${userId}, ${userEmail}, ${frequency}, from ${startTime}`)
    const [notificationProps, notificationCount] = await getEmailNotifications(
      audiusLibs,
      userId,
      announcements,
      startTime,
      5)
    const emailSubject = `${notificationCount} unread notification${notificationCount > 1 ? 's' : ''} on Audius`
    if (notificationCount === 0) {
      logger.info(`renderAndSendEmail - 0 notifications detected for user ${userId}, bypassing email`)
      return
    }

    let renderProps = {}
    renderProps['notifications'] = notificationProps
    if (frequency === 'daily') {
      renderProps['title'] = `Daily Email - ${userEmail}`
    } else if (frequency === 'weekly') {
      renderProps['title'] = `Weekly Email - ${userEmail}`
    }

    let now = moment()
    let dayAgo = now.clone().subtract(1, 'days')
    let weekAgo = now.clone().subtract(7, 'days')
    let formattedDayAgo = dayAgo.format('MMMM Do YYYY')
    let shortWeekAgoFormat = weekAgo.format('MMMM Do')
    let weeklySubjectFormat = `${notificationCount} unread notification${notificationCount > 1 ? 's' : ''} from ${shortWeekAgoFormat} - ${formattedDayAgo}`
    let dailySubjectFormat = `${notificationCount} unread notification${notificationCount > 1 ? 's' : ''} from ${formattedDayAgo}`

    const subject = frequency === 'daily' ? dailySubjectFormat : weeklySubjectFormat
    renderProps['subject'] = subject
    const notifHtml = renderEmail(renderProps)

    const emailParams = {
      from: 'Audius <notify@audius.co>',
      to: `${userEmail}`,
      bcc: 'audius-email-test@audius.co',
      html: notifHtml,
      subject: emailSubject
    }

    // Send email
    await sendEmail(emailParams)

    // Cache on file system
    await cacheEmail({ renderProps, emailParams })

    return true
  } catch (e) {
    logger.error(`Error in renderAndSendEmail ${e}`)
    return false
  }
}

async function cacheEmail (cacheParams) {
  try {
    let uuid = uuidv4()
    let timestamp = moment().valueOf()
    let fileName = `${uuid}-${timestamp.toString()}.json`
    let filePath = path.join(emailCachePath, fileName)
    await new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(cacheParams), (error) => {
        if (error) {
          reject(error)
        }
        resolve()
      })
    })
  } catch (e) {
    logger.error(`Error in cacheEmail ${e}`)
  }
}

async function sendEmail (emailParams) {
  return new Promise((resolve, reject) => {
    if (mg === null) {
      resolve()
    }
    mg.messages().send(emailParams, (error, body) => {
      if (error) {
        reject(error)
      }
      resolve(body)
    })
  })
}

module.exports = { processEmailNotifications }
