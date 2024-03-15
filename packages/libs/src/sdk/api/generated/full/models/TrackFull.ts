/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
/**
 * API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { Access } from './Access';
import {
    AccessFromJSON,
    AccessFromJSONTyped,
    AccessToJSON,
} from './Access';
import type { CoverArt } from './CoverArt';
import {
    CoverArtFromJSON,
    CoverArtFromJSONTyped,
    CoverArtToJSON,
} from './CoverArt';
import type { DownloadMetadata } from './DownloadMetadata';
import {
    DownloadMetadataFromJSON,
    DownloadMetadataFromJSONTyped,
    DownloadMetadataToJSON,
} from './DownloadMetadata';
import type { Favorite } from './Favorite';
import {
    FavoriteFromJSON,
    FavoriteFromJSONTyped,
    FavoriteToJSON,
} from './Favorite';
import type { FieldVisibility } from './FieldVisibility';
import {
    FieldVisibilityFromJSON,
    FieldVisibilityFromJSONTyped,
    FieldVisibilityToJSON,
} from './FieldVisibility';
import type { FullRemixParent } from './FullRemixParent';
import {
    FullRemixParentFromJSON,
    FullRemixParentFromJSONTyped,
    FullRemixParentToJSON,
} from './FullRemixParent';
import type { PremiumContentSignature } from './PremiumContentSignature';
import {
    PremiumContentSignatureFromJSON,
    PremiumContentSignatureFromJSONTyped,
    PremiumContentSignatureToJSON,
} from './PremiumContentSignature';
import type { Repost } from './Repost';
import {
    RepostFromJSON,
    RepostFromJSONTyped,
    RepostToJSON,
} from './Repost';
import type { StemParent } from './StemParent';
import {
    StemParentFromJSON,
    StemParentFromJSONTyped,
    StemParentToJSON,
} from './StemParent';
import type { TrackArtwork } from './TrackArtwork';
import {
    TrackArtworkFromJSON,
    TrackArtworkFromJSONTyped,
    TrackArtworkToJSON,
} from './TrackArtwork';
import type { TrackSegment } from './TrackSegment';
import {
    TrackSegmentFromJSON,
    TrackSegmentFromJSONTyped,
    TrackSegmentToJSON,
} from './TrackSegment';
import type { UserFull } from './UserFull';
import {
    UserFullFromJSON,
    UserFullFromJSONTyped,
    UserFullToJSON,
} from './UserFull';

/**
 * 
 * @export
 * @interface TrackFull
 */
export interface TrackFull {
    /**
     * 
     * @type {TrackArtwork}
     * @memberof TrackFull
     */
    artwork?: TrackArtwork;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    genre?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    trackCid?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    previewCid?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    origFileCid?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    origFilename?: string;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isOriginalAvailable?: boolean;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    mood?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    releaseDate?: string;
    /**
     * 
     * @type {FullRemixParent}
     * @memberof TrackFull
     */
    remixOf?: FullRemixParent;
    /**
     * 
     * @type {number}
     * @memberof TrackFull
     */
    repostCount: number;
    /**
     * 
     * @type {number}
     * @memberof TrackFull
     */
    favoriteCount: number;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    tags?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    title: string;
    /**
     * 
     * @type {UserFull}
     * @memberof TrackFull
     */
    user: UserFull;
    /**
     * 
     * @type {number}
     * @memberof TrackFull
     */
    duration: number;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isDownloadable?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    downloadable?: boolean;
    /**
     * 
     * @type {number}
     * @memberof TrackFull
     */
    playCount: number;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    permalink?: string;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isStreamable?: boolean;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    ddexApp?: string;
    /**
     * 
     * @type {Array<number>}
     * @memberof TrackFull
     */
    playlistsContainingTrack?: Array<number>;
    /**
     * 
     * @type {number}
     * @memberof TrackFull
     */
    blocknumber: number;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    createDate?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    coverArtSizes?: string;
    /**
     * 
     * @type {CoverArt}
     * @memberof TrackFull
     */
    coverArtCids?: CoverArt;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    creditsSplits?: string;
    /**
     * 
     * @type {DownloadMetadata}
     * @memberof TrackFull
     */
    download?: DownloadMetadata;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    isrc?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    license?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    iswc?: string;
    /**
     * 
     * @type {object}
     * @memberof TrackFull
     */
    ddexReleaseIds?: object;
    /**
     * 
     * @type {FieldVisibility}
     * @memberof TrackFull
     */
    fieldVisibility?: FieldVisibility;
    /**
     * 
     * @type {Array<Repost>}
     * @memberof TrackFull
     */
    followeeReposts: Array<Repost>;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    hasCurrentUserReposted: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isScheduledRelease?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isUnlisted: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    hasCurrentUserSaved: boolean;
    /**
     * 
     * @type {Array<Favorite>}
     * @memberof TrackFull
     */
    followeeFavorites: Array<Favorite>;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    routeId: string;
    /**
     * 
     * @type {StemParent}
     * @memberof TrackFull
     */
    stemOf?: StemParent;
    /**
     * 
     * @type {Array<TrackSegment>}
     * @memberof TrackFull
     */
    trackSegments?: Array<TrackSegment>;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    userId: string;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isDelete?: boolean;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    coverArt?: string;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isAvailable?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isPremium?: boolean;
    /**
     * 
     * @type {object}
     * @memberof TrackFull
     */
    premiumConditions?: object;
    /**
     * 
     * @type {PremiumContentSignature}
     * @memberof TrackFull
     */
    premiumContentSignature?: PremiumContentSignature;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isStreamGated?: boolean;
    /**
     * 
     * @type {object}
     * @memberof TrackFull
     */
    streamConditions?: object;
    /**
     * 
     * @type {boolean}
     * @memberof TrackFull
     */
    isDownloadGated?: boolean;
    /**
     * 
     * @type {object}
     * @memberof TrackFull
     */
    downloadConditions?: object;
    /**
     * 
     * @type {Access}
     * @memberof TrackFull
     */
    access?: Access;
    /**
     * 
     * @type {number}
     * @memberof TrackFull
     */
    aiAttributionUserId?: number;
    /**
     * 
     * @type {string}
     * @memberof TrackFull
     */
    audioUploadId?: string;
    /**
     * 
     * @type {number}
     * @memberof TrackFull
     */
    previewStartSeconds?: number;
}

/**
 * Check if a given object implements the TrackFull interface.
 */
export function instanceOfTrackFull(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "repostCount" in value;
    isInstance = isInstance && "favoriteCount" in value;
    isInstance = isInstance && "title" in value;
    isInstance = isInstance && "user" in value;
    isInstance = isInstance && "duration" in value;
    isInstance = isInstance && "playCount" in value;
    isInstance = isInstance && "blocknumber" in value;
    isInstance = isInstance && "followeeReposts" in value;
    isInstance = isInstance && "hasCurrentUserReposted" in value;
    isInstance = isInstance && "isUnlisted" in value;
    isInstance = isInstance && "hasCurrentUserSaved" in value;
    isInstance = isInstance && "followeeFavorites" in value;
    isInstance = isInstance && "routeId" in value;
    isInstance = isInstance && "userId" in value;

    return isInstance;
}

export function TrackFullFromJSON(json: any): TrackFull {
    return TrackFullFromJSONTyped(json, false);
}

export function TrackFullFromJSONTyped(json: any, ignoreDiscriminator: boolean): TrackFull {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'artwork': !exists(json, 'artwork') ? undefined : TrackArtworkFromJSON(json['artwork']),
        'description': !exists(json, 'description') ? undefined : json['description'],
        'genre': !exists(json, 'genre') ? undefined : json['genre'],
        'id': json['id'],
        'trackCid': !exists(json, 'track_cid') ? undefined : json['track_cid'],
        'previewCid': !exists(json, 'preview_cid') ? undefined : json['preview_cid'],
        'origFileCid': !exists(json, 'orig_file_cid') ? undefined : json['orig_file_cid'],
        'origFilename': !exists(json, 'orig_filename') ? undefined : json['orig_filename'],
        'isOriginalAvailable': !exists(json, 'is_original_available') ? undefined : json['is_original_available'],
        'mood': !exists(json, 'mood') ? undefined : json['mood'],
        'releaseDate': !exists(json, 'release_date') ? undefined : json['release_date'],
        'remixOf': !exists(json, 'remix_of') ? undefined : FullRemixParentFromJSON(json['remix_of']),
        'repostCount': json['repost_count'],
        'favoriteCount': json['favorite_count'],
        'tags': !exists(json, 'tags') ? undefined : json['tags'],
        'title': json['title'],
        'user': UserFullFromJSON(json['user']),
        'duration': json['duration'],
        'isDownloadable': !exists(json, 'is_downloadable') ? undefined : json['is_downloadable'],
        'downloadable': !exists(json, 'downloadable') ? undefined : json['downloadable'],
        'playCount': json['play_count'],
        'permalink': !exists(json, 'permalink') ? undefined : json['permalink'],
        'isStreamable': !exists(json, 'is_streamable') ? undefined : json['is_streamable'],
        'ddexApp': !exists(json, 'ddex_app') ? undefined : json['ddex_app'],
        'playlistsContainingTrack': !exists(json, 'playlists_containing_track') ? undefined : json['playlists_containing_track'],
        'blocknumber': json['blocknumber'],
        'createDate': !exists(json, 'create_date') ? undefined : json['create_date'],
        'coverArtSizes': !exists(json, 'cover_art_sizes') ? undefined : json['cover_art_sizes'],
        'coverArtCids': !exists(json, 'cover_art_cids') ? undefined : CoverArtFromJSON(json['cover_art_cids']),
        'createdAt': !exists(json, 'created_at') ? undefined : json['created_at'],
        'creditsSplits': !exists(json, 'credits_splits') ? undefined : json['credits_splits'],
        'download': !exists(json, 'download') ? undefined : DownloadMetadataFromJSON(json['download']),
        'isrc': !exists(json, 'isrc') ? undefined : json['isrc'],
        'license': !exists(json, 'license') ? undefined : json['license'],
        'iswc': !exists(json, 'iswc') ? undefined : json['iswc'],
        'ddexReleaseIds': !exists(json, 'ddex_release_ids') ? undefined : json['ddex_release_ids'],
        'fieldVisibility': !exists(json, 'field_visibility') ? undefined : FieldVisibilityFromJSON(json['field_visibility']),
        'followeeReposts': ((json['followee_reposts'] as Array<any>).map(RepostFromJSON)),
        'hasCurrentUserReposted': json['has_current_user_reposted'],
        'isScheduledRelease': !exists(json, 'is_scheduled_release') ? undefined : json['is_scheduled_release'],
        'isUnlisted': json['is_unlisted'],
        'hasCurrentUserSaved': json['has_current_user_saved'],
        'followeeFavorites': ((json['followee_favorites'] as Array<any>).map(FavoriteFromJSON)),
        'routeId': json['route_id'],
        'stemOf': !exists(json, 'stem_of') ? undefined : StemParentFromJSON(json['stem_of']),
        'trackSegments': !exists(json, 'track_segments') ? undefined : ((json['track_segments'] as Array<any>).map(TrackSegmentFromJSON)),
        'updatedAt': !exists(json, 'updated_at') ? undefined : json['updated_at'],
        'userId': json['user_id'],
        'isDelete': !exists(json, 'is_delete') ? undefined : json['is_delete'],
        'coverArt': !exists(json, 'cover_art') ? undefined : json['cover_art'],
        'isAvailable': !exists(json, 'is_available') ? undefined : json['is_available'],
        'isPremium': !exists(json, 'is_premium') ? undefined : json['is_premium'],
        'premiumConditions': !exists(json, 'premium_conditions') ? undefined : json['premium_conditions'],
        'premiumContentSignature': !exists(json, 'premium_content_signature') ? undefined : PremiumContentSignatureFromJSON(json['premium_content_signature']),
        'isStreamGated': !exists(json, 'is_stream_gated') ? undefined : json['is_stream_gated'],
        'streamConditions': !exists(json, 'stream_conditions') ? undefined : json['stream_conditions'],
        'isDownloadGated': !exists(json, 'is_download_gated') ? undefined : json['is_download_gated'],
        'downloadConditions': !exists(json, 'download_conditions') ? undefined : json['download_conditions'],
        'access': !exists(json, 'access') ? undefined : AccessFromJSON(json['access']),
        'aiAttributionUserId': !exists(json, 'ai_attribution_user_id') ? undefined : json['ai_attribution_user_id'],
        'audioUploadId': !exists(json, 'audio_upload_id') ? undefined : json['audio_upload_id'],
        'previewStartSeconds': !exists(json, 'preview_start_seconds') ? undefined : json['preview_start_seconds'],
    };
}

export function TrackFullToJSON(value?: TrackFull | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'artwork': TrackArtworkToJSON(value.artwork),
        'description': value.description,
        'genre': value.genre,
        'id': value.id,
        'track_cid': value.trackCid,
        'preview_cid': value.previewCid,
        'orig_file_cid': value.origFileCid,
        'orig_filename': value.origFilename,
        'is_original_available': value.isOriginalAvailable,
        'mood': value.mood,
        'release_date': value.releaseDate,
        'remix_of': FullRemixParentToJSON(value.remixOf),
        'repost_count': value.repostCount,
        'favorite_count': value.favoriteCount,
        'tags': value.tags,
        'title': value.title,
        'user': UserFullToJSON(value.user),
        'duration': value.duration,
        'is_downloadable': value.isDownloadable,
        'downloadable': value.downloadable,
        'play_count': value.playCount,
        'permalink': value.permalink,
        'is_streamable': value.isStreamable,
        'ddex_app': value.ddexApp,
        'playlists_containing_track': value.playlistsContainingTrack,
        'blocknumber': value.blocknumber,
        'create_date': value.createDate,
        'cover_art_sizes': value.coverArtSizes,
        'cover_art_cids': CoverArtToJSON(value.coverArtCids),
        'created_at': value.createdAt,
        'credits_splits': value.creditsSplits,
        'download': DownloadMetadataToJSON(value.download),
        'isrc': value.isrc,
        'license': value.license,
        'iswc': value.iswc,
        'ddex_release_ids': value.ddexReleaseIds,
        'field_visibility': FieldVisibilityToJSON(value.fieldVisibility),
        'followee_reposts': ((value.followeeReposts as Array<any>).map(RepostToJSON)),
        'has_current_user_reposted': value.hasCurrentUserReposted,
        'is_scheduled_release': value.isScheduledRelease,
        'is_unlisted': value.isUnlisted,
        'has_current_user_saved': value.hasCurrentUserSaved,
        'followee_favorites': ((value.followeeFavorites as Array<any>).map(FavoriteToJSON)),
        'route_id': value.routeId,
        'stem_of': StemParentToJSON(value.stemOf),
        'track_segments': value.trackSegments === undefined ? undefined : ((value.trackSegments as Array<any>).map(TrackSegmentToJSON)),
        'updated_at': value.updatedAt,
        'user_id': value.userId,
        'is_delete': value.isDelete,
        'cover_art': value.coverArt,
        'is_available': value.isAvailable,
        'is_premium': value.isPremium,
        'premium_conditions': value.premiumConditions,
        'premium_content_signature': PremiumContentSignatureToJSON(value.premiumContentSignature),
        'is_stream_gated': value.isStreamGated,
        'stream_conditions': value.streamConditions,
        'is_download_gated': value.isDownloadGated,
        'download_conditions': value.downloadConditions,
        'access': AccessToJSON(value.access),
        'ai_attribution_user_id': value.aiAttributionUserId,
        'audio_upload_id': value.audioUploadId,
        'preview_start_seconds': value.previewStartSeconds,
    };
}

