import type { z } from 'zod'
import snakecaseKeys from 'snakecase-keys'
import { BaseAPI, BASE_PATH, RequiredError } from '../generated/default/runtime'

import {
  Configuration,
  StreamTrackRequest,
  TracksApi as GeneratedTracksApi
} from '../generated/default'
import type { DiscoveryNodeSelectorService } from '../../services/DiscoveryNodeSelector'
import {
  createUpdateTrackSchema,
  createUploadTrackSchema,
  DeleteTrackRequest,
  DeleteTrackSchema,
  RepostTrackRequest,
  RepostTrackSchema,
  SaveTrackRequest,
  SaveTrackSchema,
  UnrepostTrackRequest,
  UnrepostTrackSchema,
  UnsaveTrackRequest,
  UnsaveTrackSchema,
  UpdateTrackRequest,
  UploadTrackRequest
} from './types'
import type { StorageService } from '../../services/Storage'
import { retry3 } from '../../utils/retry'
import type { EntityManagerService, AuthService } from '../../services'
import {
  Action,
  EntityType,
  WriteOptions
} from '../../services/EntityManager/types'
import { decodeHashId } from '../../utils/hashId'
import { generateMetadataCidV1 } from '../../utils/cid'
import { parseRequestParameters } from '../../utils/parseRequestParameters'

// Subclass type masking adapted from Damir Arh's method:
// https://www.damirscorner.com/blog/posts/20190712-ChangeMethodSignatureInTypescriptSubclass.html
// Get the type of the generated TracksApi excluding streamTrack
type GeneratedTracksApiWithoutStream = new (config: Configuration) => {
  [P in Exclude<keyof GeneratedTracksApi, 'streamTrack'>]: GeneratedTracksApi[P]
} & BaseAPI

// Create a new "class" that masks our generated TracksApi with the new type
const TracksApiWithoutStream: GeneratedTracksApiWithoutStream =
  GeneratedTracksApi

// Extend that new class
export class TracksApi extends TracksApiWithoutStream {
  constructor(
    configuration: Configuration,
    private readonly discoveryNodeSelectorService: DiscoveryNodeSelectorService,
    private readonly storage: StorageService,
    private readonly entityManager: EntityManagerService,
    private readonly auth: AuthService
  ) {
    super(configuration)
  }

  /**
   * Get the url of the track's streamable mp3 file
   */
  async streamTrack(requestParameters: StreamTrackRequest): Promise<string> {
    if (
      requestParameters.trackId === null ||
      requestParameters.trackId === undefined
    ) {
      throw new RequiredError(
        'trackId',
        'Required parameter requestParameters.trackId was null or undefined when calling getTrack.'
      )
    }

    const path = `/tracks/{track_id}/stream`.replace(
      `{${'track_id'}}`,
      encodeURIComponent(String(requestParameters.trackId))
    )
    const host = await this.discoveryNodeSelectorService.getSelectedEndpoint()
    return `${host}${BASE_PATH}${path}`
  }
  /**
   * Upload a track
   */
  async uploadTrack(
    requestParameters: UploadTrackRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const {
      userId,
      trackFile,
      coverArtFile,
      metadata: parsedMetadata,
      onProgress
    } = parseRequestParameters(
      'uploadTrack',
      createUploadTrackSchema()
    )(requestParameters)

    // Transform metadata
    const metadata = this.transformTrackUploadMetadata(parsedMetadata, userId)

    // Upload track audio and cover art to storage node
    const [audioResp, coverArtResp] = await Promise.all([
      retry3(
        async () =>
          await this.storage.uploadFile({
            file: trackFile,
            onProgress,
            template: 'audio'
          }),
        (e) => {
          console.log('Retrying uploadTrackAudio', e)
        }
      ),
      retry3(
        async () =>
          await this.storage.uploadFile({
            file: coverArtFile,
            onProgress,
            template: 'img_square'
          }),
        (e) => {
          console.log('Retrying uploadTrackCoverArt', e)
        }
      )
    ])

    // Update metadata to include uploaded CIDs
    const updatedMetadata = {
      ...metadata,
      trackSegments: [],
      trackCid: audioResp.results['320'],
      download: metadata.download?.isDownloadable
        ? {
            ...metadata.download,
            cid: audioResp.results['320']
          }
        : metadata.download,
      coverArtSizes: coverArtResp.id,
      duration: parseInt(audioResp.probe.format.duration, 10)
    }

    // Write metadata to chain

    const metadataCid = await generateMetadataCidV1(updatedMetadata)
    const trackId = await this.generateTrackId()
    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.TRACK,
      entityId: trackId,
      action: Action.CREATE,
      metadata: JSON.stringify({
        cid: metadataCid.toString(),
        data: snakecaseKeys(updatedMetadata)
      }),
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return {
      blockHash: txReceipt.blockHash,
      blockNumber: txReceipt.blockNumber,
      trackId
    }
  }

  /**
   * Update a track
   */
  async updateTrack(
    requestParameters: UpdateTrackRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const {
      userId,
      trackId,
      coverArtFile,
      metadata: parsedMetadata,
      onProgress
    } = parseRequestParameters(
      'updateTrack',
      createUpdateTrackSchema()
    )(requestParameters)

    // Transform metadata
    const metadata = this.transformTrackUploadMetadata(parsedMetadata, userId)

    // Upload track cover art to storage node
    const coverArtResp = await retry3(
      async () =>
        await this.storage.uploadFile({
          file: coverArtFile,
          onProgress,
          template: 'img_square'
        }),
      (e) => {
        console.log('Retrying uploadTrackCoverArt', e)
      }
    )

    // Update metadata to include uploaded CIDs
    const updatedMetadata = {
      ...metadata,
      coverArtSizes: coverArtResp.id
    }

    // Write metadata to chain
    const metadataCid = await generateMetadataCidV1(updatedMetadata)
    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.TRACK,
      entityId: trackId,
      action: Action.UPDATE,
      metadata: JSON.stringify({
        cid: metadataCid.toString(),
        data: snakecaseKeys(updatedMetadata)
      }),
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return {
      blockHash: txReceipt.blockHash,
      blockNumber: txReceipt.blockNumber
    }
  }

  /**
   * Delete a track
   */
  async deleteTrack(
    requestParameters: DeleteTrackRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, trackId } = parseRequestParameters(
      'deleteTrack',
      DeleteTrackSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.TRACK,
      entityId: trackId,
      action: Action.DELETE,
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Favorite a track
   */
  async saveTrack(
    requestParameters: SaveTrackRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, trackId, metadata } = parseRequestParameters(
      'saveTrack',
      SaveTrackSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.TRACK,
      entityId: trackId,
      action: Action.SAVE,
      metadata: metadata && JSON.stringify(snakecaseKeys(metadata)),
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Unfavorite a track
   */
  async unsaveTrack(
    requestParameters: UnsaveTrackRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, trackId } = parseRequestParameters(
      'unsaveTrack',
      UnsaveTrackSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.TRACK,
      entityId: trackId,
      action: Action.UNSAVE,
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Repost a track
   */
  async repostTrack(
    requestParameters: RepostTrackRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, trackId, metadata } = parseRequestParameters(
      'respostTrack',
      RepostTrackSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.TRACK,
      entityId: trackId,
      action: Action.REPOST,
      metadata: metadata && JSON.stringify(snakecaseKeys(metadata)),
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Unrepost a track
   */
  async unrepostTrack(
    requestParameters: UnrepostTrackRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, trackId } = parseRequestParameters(
      'unrepostTrack',
      UnrepostTrackSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.TRACK,
      entityId: trackId,
      action: Action.UNREPOST,
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  private transformTrackUploadMetadata(
    inputMetadata: z.output<
      ReturnType<typeof createUploadTrackSchema>
    >['metadata'],
    userId: number
  ) {
    const metadata = {
      ...inputMetadata,
      ownerId: userId
    }

    const isPremium = metadata.isPremium
    const isUnlisted = metadata.isUnlisted

    // If track is premium, set remixes to false
    if (isPremium && metadata.fieldVisibility) {
      metadata.fieldVisibility.remixes = false
    }

    // If track is public, set required visibility fields to true
    if (!isUnlisted) {
      metadata.fieldVisibility = {
        ...metadata.fieldVisibility,
        genre: true,
        mood: true,
        tags: true,
        share: true,
        playCount: true
      }
    }
    return metadata
  }

  private async generateTrackId() {
    const response = await this.request({
      path: `/tracks/unclaimed_id`,
      method: 'GET',
      headers: {},
      query: { noCache: Math.floor(Math.random() * 1000).toString() }
    })

    const { data } = await response.json()
    const id = decodeHashId(data)
    if (id === null) {
      throw new Error('Could not generate track id')
    }
    return id
  }
}
