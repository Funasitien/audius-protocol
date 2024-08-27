import { useState } from 'react'

import { useGetUserById } from '@audius/common/api'
import { useReactToComment } from '@audius/common/context'
import type { Comment } from '@audius/sdk'

import {
  CommentText,
  Flex,
  IconButton,
  IconHeart,
  IconPencil,
  PlainButton,
  Text,
  TextLink,
  Timestamp
} from '@audius/harmony-native'
import { formatCommentTrackTimestamp } from 'app/utils/comments'

import { ProfilePicture } from '../core/ProfilePicture'
import { UserLink } from '../user-link'

import { CommentOverflowMenu } from './CommentOverflowMenu'

const messages = {
  pinned: 'Pinned by artist',
  topSupporters: 'Top Supporters',
  reply: 'Reply'
}

export type CommentBlockProps = {
  comment: Comment
  parentCommentId?: string
  hideActions?: boolean
}

export const CommentBlock = (props: CommentBlockProps) => {
  const { comment, hideActions } = props
  const {
    isPinned,
    message,
    reactCount = 0,
    trackTimestampS,
    id: commentId,
    createdAt,
    userId: userIdStr
  } = comment

  //   const [editComment] = useEditComment()
  const [reactToComment] = useReactToComment()
  const userId = Number(userIdStr)
  useGetUserById({ id: userId })

  const [reactionState, setReactionState] = useState(false) // TODO: need to pull starting value from metadata
  const [showReplyInput, setShowReplyInput] = useState(false)
  //   const isOwner = true // TODO: need to check against current user (not really feasible with modck data)
  const hasBadges = false // TODO: need to figure out how to data model these "badges" correctly

  //   const handleCommentEdit = (commentMessage: string) => {
  //     editComment(commentId, commentMessage)
  //   }

  //   const handleCommentReply = (commentMessage: string) => {
  //     postComment(commentMessage, parentCommentId ?? comment.id)
  //   }

  const handleCommentReact = () => {
    setReactionState(!reactionState)
    reactToComment(commentId, !reactionState)
  }

  return (
    <Flex direction='row' w='100%' gap='s'>
      <ProfilePicture
        style={{ width: 32, height: 32, flexShrink: 0 }}
        userId={userId}
      />
      <Flex gap='xs' w='100%' alignItems='flex-start'>
        <Flex>
          {isPinned || hasBadges ? (
            <Flex direction='row' justifyContent='space-between' w='100%'>
              {isPinned ? (
                <Flex direction='row' gap='xs'>
                  <IconPencil color='subdued' size='xs' />
                  <Text color='subdued' size='xs'>
                    {messages.pinned}
                  </Text>
                </Flex>
              ) : null}
              {hasBadges ? (
                <Text color='accent'>{messages.topSupporters}</Text>
              ) : null}
            </Flex>
          ) : null}
          <Flex direction='row' gap='s' alignItems='center'>
            <UserLink size='s' userId={userId} strength='strong' />
            <Flex direction='row' gap='xs' alignItems='center' h='100%'>
              <Timestamp time={new Date(createdAt)} />
              {trackTimestampS !== undefined ? (
                <>
                  <Text color='subdued' size='xs'>
                    •
                  </Text>

                  <TextLink size='xs' variant='active'>
                    {formatCommentTrackTimestamp(trackTimestampS)}
                  </TextLink>
                </>
              ) : null}
            </Flex>
          </Flex>
          <CommentText>{message}</CommentText>
        </Flex>

        {!hideActions ? (
          <>
            <Flex direction='row' gap='l' alignItems='center'>
              <Flex direction='row' alignItems='center' gap='xs'>
                <IconButton
                  size='m'
                  icon={IconHeart}
                  color={reactionState ? 'active' : 'subdued'}
                  aria-label='Heart comment'
                  onPress={handleCommentReact}
                />
                <Text color='default' size='s'>
                  {reactCount}
                </Text>
              </Flex>
              <PlainButton
                variant='subdued'
                onPress={() => {
                  setShowReplyInput(!showReplyInput)
                }}
              >
                {messages.reply}
              </PlainButton>
              <CommentOverflowMenu comment={comment} />
            </Flex>
          </>
        ) : null}
      </Flex>
    </Flex>
  )
}
