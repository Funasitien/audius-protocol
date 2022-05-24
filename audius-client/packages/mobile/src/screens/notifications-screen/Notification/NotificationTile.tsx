import { ReactNode } from 'react'

import { Notification } from 'audius-client/src/common/store/notifications/types'
import { View } from 'react-native'

import { Tile, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'

const messages = {
  new: 'New'
}

const useStyles = makeStyles(
  ({ spacing, palette, typography }, { isViewed }) => ({
    tile: {
      borderColor: isViewed ? 'none' : palette.primary,
      borderWidth: isViewed ? 0 : 2
    },
    content: {
      padding: spacing(4)
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing(4)
    },
    timestamp: {
      color: palette.neutralLight5,
      fontSize: typography.fontSize.xs
    },
    newPill: {
      borderRadius: 10,
      backgroundColor: palette.secondary,
      paddingHorizontal: 6,
      paddingVertical: 2
    },
    newPillText: {
      color: palette.white,
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontByWeight.bold,
      textTransform: 'uppercase'
    }
  })
)

type NotificationTileProps = {
  children: ReactNode
  onPress?: () => void
  notification: Notification
}

export const NotificationTile = (props: NotificationTileProps) => {
  const { onPress, children, notification } = props
  const { timeLabel, isViewed } = notification
  const styles = useStyles({ isViewed })

  return (
    <Tile
      onPress={onPress}
      styles={{ tile: styles.tile, content: styles.content }}
    >
      {children}
      <View style={styles.footer}>
        <Text style={styles.timestamp}>{timeLabel}</Text>
        {!isViewed ? null : (
          <View style={styles.newPill}>
            <Text style={styles.newPillText}>{messages.new}</Text>
          </View>
        )}
      </View>
    </Tile>
  )
}
