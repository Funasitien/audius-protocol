import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { esc } from './search-router'

type AlbumBacklinkMetadata = {
  playlist_id: number
  playlist_name: string
  permalink: string
  playlist_owner_id: number
}

export const trackRouter = router({
  get: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const row = await ctx.loaders.trackLoader.load(parseInt(input))
    if (!row) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }
    return row
  }),

  getAlbumBacklink: publicProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ input }) => {
      const found = await esc.search<AlbumBacklinkMetadata>({
        index: 'playlists',
        query: {
          bool: {
            must: [
              { term: { 'playlist_contents.track_ids.track': input.trackId } },
              { term: { is_delete: false } },
              { term: { is_private: false } },
              { term: { is_album: true } },
            ],
            must_not: [],
            should: [],
          },
        },
        size: 1,
        sort: [{ created_at: { order: 'desc' } }],
        _source: [
          'playlist_id',
          'playlist_name',
          'permalink',
          'playlist_owner_id',
        ],
      })

      const hits = found.hits.hits.map((h) => h._source)
      return hits.length > 0 ? hits[0] : null
    }),
})
