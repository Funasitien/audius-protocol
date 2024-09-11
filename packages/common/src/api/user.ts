import { full } from '@audius/sdk'

import { transformAndCleanList, userTrackMetadataFromSDK } from '~/adapters'
import { userMetadataListFromSDK } from '~/adapters/user'
import { createApi } from '~/audius-query'
import { ID, Kind, OptionalId, StringUSDC } from '~/models'
import {
  USDCTransactionDetails,
  USDCTransactionMethod,
  USDCTransactionType
} from '~/models/USDCTransactions'
import { encodeHashId } from '~/utils'
import { Nullable } from '~/utils/typeUtils'

import { SDKRequest } from './types'
import { Id } from './utils'

type GetUSDCTransactionListArgs = {
  userId: Nullable<ID>
  offset: number
  limit: number
  sortMethod?: full.GetUSDCTransactionsSortMethodEnum
  sortDirection?: full.GetUSDCTransactionsSortDirectionEnum
  type?: full.GetUSDCTransactionsTypeEnum[]
  method?: full.GetUSDCTransactionsMethodEnum
}

/**
 * Parser to reformat transactions as they come back from the API.
 * @param transaction the transaction to parse
 */
const parseTransaction = ({
  transaction
}: {
  transaction: full.TransactionDetails
}): USDCTransactionDetails => {
  const { change, balance, transactionType, method, ...rest } = transaction
  return {
    ...rest,
    transactionType: transactionType as USDCTransactionType,
    method: method as USDCTransactionMethod,
    change: change as StringUSDC,
    balance: balance as StringUSDC
  }
}

const userApi = createApi({
  reducerPath: 'userApi',
  endpoints: {
    getUserById: {
      fetch: async (
        { id, currentUserId }: { id: ID; currentUserId?: Nullable<ID> },
        { audiusSdk }
      ) => {
        if (!id || id === -1) return null
        const sdk = await audiusSdk()
        const { data: users = [] } = await sdk.full.users.getUser({
          id: Id.parse(id),
          userId: OptionalId.parse(currentUserId)
        })
        return userMetadataListFromSDK(users)[0]
      },
      fetchBatch: async (
        { ids, currentUserId }: { ids: ID[]; currentUserId?: Nullable<ID> },
        { audiusSdk }
      ) => {
        const sdk = await audiusSdk()
        const { data: users = [] } = await sdk.full.users.getBulkUsers({
          id: ids.filter((id) => id && id !== -1).map((id) => Id.parse(id)),
          userId: OptionalId.parse(currentUserId)
        })
        return userMetadataListFromSDK(users)
      },
      options: {
        idArgKey: 'id',
        kind: Kind.USERS,
        schemaKey: 'user'
      }
    },
    getUserByHandle: {
      fetch: async (
        {
          handle,
          currentUserId
        }: { handle: string; currentUserId: Nullable<ID> },
        { audiusSdk }
      ) => {
        const sdk = await audiusSdk()
        const { data: users = [] } = await sdk.full.users.getUserByHandle({
          handle,
          userId: OptionalId.parse(currentUserId)
        })
        return userMetadataListFromSDK(users)[0]
      },
      options: {
        kind: Kind.USERS,
        schemaKey: 'user'
      }
    },
    getUsersByIds: {
      fetch: async (args: { ids: ID[] }, context) => {
        const { ids } = args
        const { audiusBackend } = context
        return await audiusBackend.getCreators(ids)
      },
      options: { idListArgKey: 'ids', kind: Kind.USERS, schemaKey: 'users' }
    },
    getTracksByUser: {
      fetch: async (
        {
          id,
          currentUserId,
          ...params
        }: {
          id: ID
        } & SDKRequest<full.GetTracksByUserRequest>,
        { audiusSdk }
      ) => {
        const sdk = await audiusSdk()
        const { data = [] } = await sdk.full.users.getTracksByUser({
          ...params,
          id: Id.parse(id),
          userId: OptionalId.parse(currentUserId)
        })
        return transformAndCleanList(data, userTrackMetadataFromSDK)
      },
      options: {
        kind: Kind.TRACKS,
        schemaKey: 'tracks'
      }
    },
    getUSDCTransactions: {
      fetch: async (
        {
          offset,
          limit,
          userId,
          sortDirection,
          sortMethod,
          type,
          method
        }: GetUSDCTransactionListArgs,
        context
      ) => {
        const sdk = await context.audiusSdk()
        const { data = [] } = await sdk.full.users.getUSDCTransactions({
          limit,
          offset,
          sortDirection,
          sortMethod,
          id: Id.parse(userId!),
          type,
          method
        })

        return data.map((transaction) => parseTransaction({ transaction }))
      },
      options: { retry: true }
    },
    getUSDCTransactionsCount: {
      fetch: async (
        {
          userId,
          type,
          method
        }: Pick<GetUSDCTransactionListArgs, 'userId' | 'type' | 'method'>,
        { audiusSdk }
      ) => {
        const sdk = await audiusSdk()
        const { data } = await sdk.full.users.getUSDCTransactionCount({
          id: Id.parse(userId!),
          type,
          method
        })
        return data ?? 0
      },
      options: { retry: true }
    },
    getRemixers: {
      fetch: async (
        { userId, trackId }: { userId: ID; trackId?: string },
        { audiusSdk }
      ) => {
        const sdk = await audiusSdk()
        const { data: users = [] } = await sdk.full.users.getRemixers({
          id: Id.parse(userId),
          trackId
        })
        return userMetadataListFromSDK(users)
      },
      options: {
        kind: Kind.USERS,
        schemaKey: 'users'
      }
    },
    getRemixersCount: {
      fetch: async (
        { userId, trackId }: { userId: ID; trackId?: number },
        { audiusSdk }
      ) => {
        const sdk = await audiusSdk()
        const { data } = await sdk.full.users.getRemixersCount({
          id: Id.parse(userId),
          userId: Id.parse(userId),
          trackId: trackId ? encodeHashId(trackId) : undefined
        })
        return data
      },
      options: {}
    },
    getPurchasersCount: {
      fetch: async (
        {
          userId,
          contentId,
          contentType
        }: { userId: ID; contentId?: number; contentType?: string },
        { audiusSdk }
      ) => {
        const sdk = await audiusSdk()
        const { data } = await sdk.full.users.getPurchasersCount({
          id: encodeHashId(userId),
          contentId: contentId ? encodeHashId(contentId) : undefined,
          contentType
        })
        return data ?? 0
      },
      options: {}
    },
    getRemixedTracks: {
      fetch: async ({ userId }: { userId: ID }, { audiusSdk }) => {
        const sdk = await audiusSdk()
        const { data = [] } = await sdk.full.users.getUserTracksRemixed({
          id: Id.parse(userId)
        })
        return transformAndCleanList(data, userTrackMetadataFromSDK)
      },
      options: {
        kind: Kind.TRACKS,
        schemaKey: 'tracks'
      }
    },
    getSalesAggegrate: {
      fetch: async ({ userId }: { userId: ID }, { audiusSdk }) => {
        const sdk = await audiusSdk()
        const { data } = await sdk.users.getSalesAggregate({
          id: Id.parse(userId)
        })
        return data
      },
      options: {}
    }
  }
})

export const {
  useGetUserById,
  useGetUsersByIds,
  useGetUserByHandle,
  useGetTracksByUser,
  useGetUSDCTransactions,
  useGetUSDCTransactionsCount,
  useGetRemixers,
  useGetRemixersCount,
  useGetPurchasersCount,
  useGetRemixedTracks,
  useGetSalesAggegrate
} = userApi.hooks
export const userApiReducer = userApi.reducer
export const userApiFetch = userApi.fetch
export const userApiActions = userApi.actions
export const userApiUtils = userApi.util
