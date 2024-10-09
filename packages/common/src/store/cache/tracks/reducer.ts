import { merge } from 'lodash'

import { Cache } from '~/models/Cache'
import { ID } from '~/models/Identifiers'
import { Kind } from '~/models/Kind'
import { Track } from '~/models/Track'
import { initialCacheState } from '~/store/cache/reducer'

import {
  AddEntriesAction,
  AddSuccededAction,
  ADD_ENTRIES,
  ADD_SUCCEEDED
} from '../actions'
import { Entry } from '../types'

import {
  INCREMENT_TRACK_COMMENT_COUNT,
  SET_PERMALINK,
  SET_STREAM_URLS,
  SET_PINNED_COMMENT_ID,
  incrementTrackCommentCount,
  setPermalink,
  setStreamUrls,
  setPinnedCommentId
} from './actions'
import { TracksCacheState } from './types'

const initialState: TracksCacheState = {
  ...(initialCacheState as unknown as Cache<Track>),
  permalinks: {},
  streamUrls: {}
}

const addEntries = (state: TracksCacheState, entries: Entry[]) => {
  const newPermalinks: Record<string, ID> = {}

  for (const entry of entries) {
    const { track_id, permalink } = entry.metadata

    if (permalink) {
      newPermalinks[permalink.toLowerCase()] = track_id
    }
  }

  return {
    ...state,
    permalinks: {
      ...state.permalinks,
      ...newPermalinks
    }
  }
}

const actionsMap = {
  [ADD_SUCCEEDED](
    state: TracksCacheState,
    action: AddSuccededAction<Track>
  ): TracksCacheState {
    const { entries } = action
    return addEntries(state, entries)
  },
  [ADD_ENTRIES](
    state: TracksCacheState,
    action: AddEntriesAction<Track>,
    kind: Kind
  ): TracksCacheState {
    const { entriesByKind } = action
    const matchingEntries = entriesByKind[kind]

    if (!matchingEntries) return state
    const cacheableEntries: Entry[] = Object.entries(matchingEntries).map(
      ([id, entry]) => ({
        id: parseInt(id, 10),
        metadata: entry
      })
    )
    return addEntries(state, cacheableEntries)
  },
  [SET_PERMALINK](
    state: TracksCacheState,
    action: ReturnType<typeof setPermalink>
  ): TracksCacheState {
    const { permalink, trackId } = action

    if (!permalink) return state
    return {
      ...state,
      permalinks: { ...state.permalinks, [permalink.toLowerCase()]: trackId }
    }
  },
  [SET_STREAM_URLS](
    state: TracksCacheState,
    action: ReturnType<typeof setStreamUrls>
  ): TracksCacheState {
    const { streamUrls } = action

    if (!streamUrls) return state
    return {
      ...state,
      streamUrls: { ...state.streamUrls, ...streamUrls }
    }
  },
  [INCREMENT_TRACK_COMMENT_COUNT](
    state: TracksCacheState,
    action: ReturnType<typeof incrementTrackCommentCount>
  ): TracksCacheState {
    const { trackId, commentCountIncrement } = action

    return merge(state, {
      entries: {
        [trackId]: {
          metadata: {
            comment_count:
              (state.entries[trackId].metadata.comment_count || 0) +
              commentCountIncrement
          }
        }
      }
    })
  },
  [SET_PINNED_COMMENT_ID](
    state: TracksCacheState,
    action: ReturnType<typeof setPinnedCommentId>
  ): TracksCacheState {
    const { trackId, commentId } = action

    return merge(state, {
      entries: {
        [trackId]: { metadata: { pinned_comment_id: commentId } }
      }
    })
  }
}

const reducer = (
  state: TracksCacheState = initialState,
  action: any,
  kind: Kind
) => {
  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action, kind)
}

export default reducer
