import {
  useCurrentCommentSection,
  usePostComment
} from '@audius/common/context'
import { Status } from '@audius/common/models'
import { TouchableOpacity } from 'react-native'

import {
  Flex,
  IconCaretRight,
  Paper,
  PlainButton,
  Text
} from '@audius/harmony-native'
import { useDrawer } from 'app/hooks/useDrawer'

import Skeleton from '../skeleton'

import { CommentBlock } from './CommentBlock'
import { CommentForm } from './CommentForm'

const messages = {
  noComments: 'Nothing here yet',
  viewAll: 'View all'
}

const CommentSectionHeader = () => {
  const {
    artistId,
    currentUserId,
    entityId,
    commentSectionLoading: isLoading,
    comments,
    isEntityOwner
  } = useCurrentCommentSection()
  const { onOpen: openDrawer } = useDrawer('Comment')

  const handlePressViewAll = () => {
    openDrawer({ userId: currentUserId, entityId, isEntityOwner, artistId })
  }

  const isShowingComments = !isLoading && comments?.length

  return (
    <Flex
      direction='row'
      w='100%'
      justifyContent='space-between'
      alignItems='center'
    >
      <Text variant='title' size='m'>
        Comments
        {isShowingComments ? (
          <Text color='subdued'>&nbsp;({comments.length})</Text>
        ) : null}
      </Text>
      {isShowingComments ? (
        <PlainButton
          onPress={handlePressViewAll}
          iconRight={IconCaretRight}
          variant='subdued'
        >
          {messages.viewAll}
        </PlainButton>
      ) : null}
    </Flex>
  )
}

const CommentSectionContent = () => {
  const { commentSectionLoading: isLoading, comments } =
    useCurrentCommentSection()

  const [postComment, { status: postCommentStatus }] = usePostComment()

  const handlePostComment = (message: string) => {
    postComment(message, undefined)
  }

  // Loading state
  if (isLoading) {
    return (
      <Flex direction='row' gap='s' alignItems='center'>
        <Skeleton width={40} height={40} style={{ borderRadius: 100 }} />
        <Flex gap='s'>
          <Skeleton height={20} width={240} />
          <Skeleton height={20} width={160} />
        </Flex>
      </Flex>
    )
  }

  // Empty state
  if (!comments || !comments.length) {
    return (
      <Flex gap='m'>
        <Text variant='body'>{messages.noComments}</Text>
        <CommentForm
          onSubmit={handlePostComment}
          isLoading={postCommentStatus === Status.LOADING}
        />
      </Flex>
    )
  }

  return <CommentBlock comment={comments[0]} hideActions />
}

export const CommentSection = () => {
  const { artistId, currentUserId, entityId, isEntityOwner } =
    useCurrentCommentSection()

  const { onOpen: openDrawer } = useDrawer('Comment')

  const handlePress = () => {
    openDrawer({ userId: currentUserId, entityId, isEntityOwner, artistId })
  }

  return (
    <Flex gap='s' direction='column' w='100%' alignItems='flex-start'>
      <CommentSectionHeader />
      <Paper w='100%' direction='column' gap='s' p='l'>
        <TouchableOpacity onPress={handlePress}>
          <CommentSectionContent />
        </TouchableOpacity>
      </Paper>
    </Flex>
  )
}
