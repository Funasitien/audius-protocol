import {
  transformAndCleanList,
  userTrackMetadataFromSDK
} from '@audius/common/adapters'
import { ID, OptionalId, Track } from '@audius/common/models'
import { getSDK } from '@audius/common/store'
import { call } from 'typed-redux-saga'

import { processAndCacheTracks } from 'common/store/cache/tracks/utils'

type RetrieveUserTracksArgs = {
  handle: string
  currentUserId: ID | null
  sort?: 'date' | 'plays'
  offset?: number
  limit?: number
  /**
   * This will only let a user obtain their own unlisted tracks, not
   * anyone's unlisted tracks. Prevention logic is in discovery node.
   */
  getUnlisted?: boolean
}

export function* retrieveUserTracks({
  handle,
  currentUserId,
  sort,
  offset,
  limit,
  getUnlisted = false
}: RetrieveUserTracksArgs): Generator<any, Track[], any> {
  const sdk = yield* getSDK()
  const { data = [] } = yield* call(
    [sdk.full.users, sdk.full.users.getTracksByUserHandle],
    {
      handle,
      sort,
      limit,
      offset,
      userId: OptionalId.parse(currentUserId),
      filterTracks: getUnlisted ? 'all' : 'public'
    }
  )
  const apiTracks = transformAndCleanList(data, userTrackMetadataFromSDK)
  const processed: Track[] = yield processAndCacheTracks(apiTracks)
  return processed
}
