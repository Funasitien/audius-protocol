import { formatReleaseDate } from '@audius/common/utils'
import {
  Text,
  IconCalendarMonth,
  Flex,
  useTheme,
  IconVisibilityHidden
} from '@audius/harmony'
import dayjs from 'dayjs'

import { getLocalTimezone } from 'utils/dateUtils'

const messages = {
  hidden: 'Hidden',
  releases: (date: string) =>
    `Releases ${formatReleaseDate({
      date,
      withHour: true
    })} ${getLocalTimezone()}`
}

export type VisibilityLabelProps = {
  releaseDate?: string | null
  isUnlisted?: boolean
  isScheduledRelease?: boolean
}

export const VisibilityLabel = (props: VisibilityLabelProps) => {
  const { releaseDate, isUnlisted, isScheduledRelease } = props
  const { color } = useTheme()

  if (
    !releaseDate ||
    !isUnlisted ||
    !isScheduledRelease ||
    dayjs(releaseDate).isBefore(dayjs())
  ) {
    return null
  }

  if (isUnlisted && !isScheduledRelease) {
    return (
      <Flex alignItems='center' gap='xs'>
        <IconVisibilityHidden size='s' color='subdued' />
        <Text variant='body' size='xs' color='subdued'>
          {messages.hidden}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex alignItems='center' gap='xs'>
      <IconCalendarMonth size='s' fill={color.icon.accent} />
      <Text variant='body' size='xs' color='accent'>
        {messages.releases(releaseDate)}
      </Text>
    </Flex>
  )
}