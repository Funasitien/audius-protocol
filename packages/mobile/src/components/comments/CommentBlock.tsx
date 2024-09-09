import { useState } from 'react'

import { useGetCommentById, useGetUserById } from '@audius/common/api'
import {
  useCurrentCommentSection,
  useReactToComment
} from '@audius/common/context'
import type { Comment, ReplyComment } from '@audius/sdk'

import {
  ArtistPick,
  Box,
  CommentText,
  Flex,
  PlainButton,
  Text,
  TextLink,
  Timestamp
} from '@audius/harmony-native'
import { formatCommentTrackTimestamp } from 'app/utils/comments'

import { ProfilePicture } from '../core/ProfilePicture'
import { FavoriteButton } from '../favorite-button'
import { UserLink } from '../user-link'

import { CommentBadge } from './CommentBadge'
import { CommentOverflowMenu } from './CommentOverflowMenu'

const messages = {
  pinned: 'Pinned by artist',
  topSupporters: 'Top Supporters',
  reply: 'Reply'
}

export type CommentBlockProps = {
  commentId: string
  parentCommentId?: string
  hideActions?: boolean
}

export const CommentBlockInternal = (
  props: Omit<CommentBlockProps, 'commentId'> & {
    comment: Comment | ReplyComment
  }
) => {
  const { comment, hideActions } = props
  const { artistId, setReplyingToComment } = useCurrentCommentSection()
  const {
    message,
    reactCount = 0,
    trackTimestampS,
    id: commentId,
    createdAt,
    userId: commentUserIdStr,
    isArtistReacted,
    isCurrentUserReacted
  } = comment
  const isPinned = 'isPinned' in comment ? comment.isPinned : false // pins dont exist on replies

  const [reactToComment] = useReactToComment()
  const commentUserId = Number(commentUserIdStr)
  useGetUserById({ id: commentUserId })

  const [reactionState, setReactionState] = useState(isCurrentUserReacted) // TODO: need to pull starting value from metadata
  const isCommentByArtist = commentUserId === artistId

  const handleCommentReact = () => {
    setReactionState(!reactionState)
    reactToComment(commentId, !reactionState)
  }

  return (
    <Flex direction='row' w='100%' gap='s'>
      <ProfilePicture
        style={{ width: 32, height: 32, flexShrink: 0 }}
        userId={commentUserId}
      />
      <Flex gap='xs' w='100%' alignItems='flex-start' style={{ flexShrink: 1 }}>
        <Box style={{ position: 'absolute', top: 0, right: 0 }}>
          <CommentBadge
            isArtist={isCommentByArtist}
            commentUserId={commentUserId}
          />
        </Box>
        {isPinned || isArtistReacted ? (
          <Flex direction='row' justifyContent='space-between' w='100%'>
            <ArtistPick isLiked={isArtistReacted} isPinned={isPinned} />
          </Flex>
        ) : null}
        <Flex direction='row' gap='s' alignItems='center'>
          <UserLink size='s' userId={commentUserId} strength='strong' />
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

        {!hideActions ? (
          <>
            <Flex direction='row' gap='l' alignItems='center'>
              <Flex direction='row' alignItems='center' gap='xs'>
                <FavoriteButton
                  onPress={handleCommentReact}
                  isActive={reactionState}
                  wrapperStyle={{ height: 20, width: 20 }}
                />
                <Text color='default' size='s'>
                  {reactCount}
                </Text>
              </Flex>
              <PlainButton
                variant='subdued'
                onPress={() => {
                  setReplyingToComment?.(comment)
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

// This is an extra component wrapper because the comment data coming back from aquery could be undefined
// There's no way to return early in the above component due to rules of hooks ordering
export const CommentBlock = (props: CommentBlockProps) => {
  const { data: comment } = useGetCommentById({ id: props.commentId })
  if (!comment) return null
  return <CommentBlockInternal {...props} comment={comment} />
}
