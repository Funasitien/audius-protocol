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
import type { Favorite } from './Favorite';
import {
    FavoriteFromJSON,
    FavoriteFromJSONTyped,
    FavoriteToJSON,
} from './Favorite';
import type { PlaylistAddedTimestamp } from './PlaylistAddedTimestamp';
import {
    PlaylistAddedTimestampFromJSON,
    PlaylistAddedTimestampFromJSONTyped,
    PlaylistAddedTimestampToJSON,
} from './PlaylistAddedTimestamp';
import type { PlaylistArtwork } from './PlaylistArtwork';
import {
    PlaylistArtworkFromJSON,
    PlaylistArtworkFromJSONTyped,
    PlaylistArtworkToJSON,
} from './PlaylistArtwork';
import type { Repost } from './Repost';
import {
    RepostFromJSON,
    RepostFromJSONTyped,
    RepostToJSON,
} from './Repost';
import type { TrackFull } from './TrackFull';
import {
    TrackFullFromJSON,
    TrackFullFromJSONTyped,
    TrackFullToJSON,
} from './TrackFull';
import type { UserFull } from './UserFull';
import {
    UserFullFromJSON,
    UserFullFromJSONTyped,
    UserFullToJSON,
} from './UserFull';

/**
 * 
 * @export
 * @interface PlaylistFullWithoutTracks
 */
export interface PlaylistFullWithoutTracks {
    /**
     * 
     * @type {PlaylistArtwork}
     * @memberof PlaylistFullWithoutTracks
     */
    artwork?: PlaylistArtwork;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    permalink?: string;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    id: string;
    /**
     * 
     * @type {boolean}
     * @memberof PlaylistFullWithoutTracks
     */
    isAlbum: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof PlaylistFullWithoutTracks
     */
    isImageAutogenerated: boolean;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    playlistName: string;
    /**
     * 
     * @type {Array<PlaylistAddedTimestamp>}
     * @memberof PlaylistFullWithoutTracks
     */
    playlistContents: Array<PlaylistAddedTimestamp>;
    /**
     * 
     * @type {number}
     * @memberof PlaylistFullWithoutTracks
     */
    repostCount: number;
    /**
     * 
     * @type {number}
     * @memberof PlaylistFullWithoutTracks
     */
    favoriteCount: number;
    /**
     * 
     * @type {number}
     * @memberof PlaylistFullWithoutTracks
     */
    totalPlayCount: number;
    /**
     * 
     * @type {UserFull}
     * @memberof PlaylistFullWithoutTracks
     */
    user: UserFull;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    ddexApp?: string;
    /**
     * 
     * @type {Access}
     * @memberof PlaylistFullWithoutTracks
     */
    access?: Access;
    /**
     * 
     * @type {number}
     * @memberof PlaylistFullWithoutTracks
     */
    blocknumber: number;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    createdAt?: string;
    /**
     * 
     * @type {Array<Repost>}
     * @memberof PlaylistFullWithoutTracks
     */
    followeeReposts: Array<Repost>;
    /**
     * 
     * @type {Array<Favorite>}
     * @memberof PlaylistFullWithoutTracks
     */
    followeeFavorites: Array<Favorite>;
    /**
     * 
     * @type {boolean}
     * @memberof PlaylistFullWithoutTracks
     */
    hasCurrentUserReposted: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof PlaylistFullWithoutTracks
     */
    hasCurrentUserSaved: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof PlaylistFullWithoutTracks
     */
    isDelete: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof PlaylistFullWithoutTracks
     */
    isPrivate: boolean;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    updatedAt?: string;
    /**
     * 
     * @type {Array<PlaylistAddedTimestamp>}
     * @memberof PlaylistFullWithoutTracks
     */
    addedTimestamps: Array<PlaylistAddedTimestamp>;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    userId: string;
    /**
     * 
     * @type {Array<TrackFull>}
     * @memberof PlaylistFullWithoutTracks
     */
    tracks?: Array<TrackFull>;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    coverArt?: string;
    /**
     * 
     * @type {string}
     * @memberof PlaylistFullWithoutTracks
     */
    coverArtSizes?: string;
    /**
     * 
     * @type {PlaylistArtwork}
     * @memberof PlaylistFullWithoutTracks
     */
    coverArtCids?: PlaylistArtwork;
    /**
     * 
     * @type {number}
     * @memberof PlaylistFullWithoutTracks
     */
    trackCount: number;
}

/**
 * Check if a given object implements the PlaylistFullWithoutTracks interface.
 */
export function instanceOfPlaylistFullWithoutTracks(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "isAlbum" in value;
    isInstance = isInstance && "isImageAutogenerated" in value;
    isInstance = isInstance && "playlistName" in value;
    isInstance = isInstance && "playlistContents" in value;
    isInstance = isInstance && "repostCount" in value;
    isInstance = isInstance && "favoriteCount" in value;
    isInstance = isInstance && "totalPlayCount" in value;
    isInstance = isInstance && "user" in value;
    isInstance = isInstance && "blocknumber" in value;
    isInstance = isInstance && "followeeReposts" in value;
    isInstance = isInstance && "followeeFavorites" in value;
    isInstance = isInstance && "hasCurrentUserReposted" in value;
    isInstance = isInstance && "hasCurrentUserSaved" in value;
    isInstance = isInstance && "isDelete" in value;
    isInstance = isInstance && "isPrivate" in value;
    isInstance = isInstance && "addedTimestamps" in value;
    isInstance = isInstance && "userId" in value;
    isInstance = isInstance && "trackCount" in value;

    return isInstance;
}

export function PlaylistFullWithoutTracksFromJSON(json: any): PlaylistFullWithoutTracks {
    return PlaylistFullWithoutTracksFromJSONTyped(json, false);
}

export function PlaylistFullWithoutTracksFromJSONTyped(json: any, ignoreDiscriminator: boolean): PlaylistFullWithoutTracks {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'artwork': !exists(json, 'artwork') ? undefined : PlaylistArtworkFromJSON(json['artwork']),
        'description': !exists(json, 'description') ? undefined : json['description'],
        'permalink': !exists(json, 'permalink') ? undefined : json['permalink'],
        'id': json['id'],
        'isAlbum': json['is_album'],
        'isImageAutogenerated': json['is_image_autogenerated'],
        'playlistName': json['playlist_name'],
        'playlistContents': ((json['playlist_contents'] as Array<any>).map(PlaylistAddedTimestampFromJSON)),
        'repostCount': json['repost_count'],
        'favoriteCount': json['favorite_count'],
        'totalPlayCount': json['total_play_count'],
        'user': UserFullFromJSON(json['user']),
        'ddexApp': !exists(json, 'ddex_app') ? undefined : json['ddex_app'],
        'access': !exists(json, 'access') ? undefined : AccessFromJSON(json['access']),
        'blocknumber': json['blocknumber'],
        'createdAt': !exists(json, 'created_at') ? undefined : json['created_at'],
        'followeeReposts': ((json['followee_reposts'] as Array<any>).map(RepostFromJSON)),
        'followeeFavorites': ((json['followee_favorites'] as Array<any>).map(FavoriteFromJSON)),
        'hasCurrentUserReposted': json['has_current_user_reposted'],
        'hasCurrentUserSaved': json['has_current_user_saved'],
        'isDelete': json['is_delete'],
        'isPrivate': json['is_private'],
        'updatedAt': !exists(json, 'updated_at') ? undefined : json['updated_at'],
        'addedTimestamps': ((json['added_timestamps'] as Array<any>).map(PlaylistAddedTimestampFromJSON)),
        'userId': json['user_id'],
        'tracks': !exists(json, 'tracks') ? undefined : ((json['tracks'] as Array<any>).map(TrackFullFromJSON)),
        'coverArt': !exists(json, 'cover_art') ? undefined : json['cover_art'],
        'coverArtSizes': !exists(json, 'cover_art_sizes') ? undefined : json['cover_art_sizes'],
        'coverArtCids': !exists(json, 'cover_art_cids') ? undefined : PlaylistArtworkFromJSON(json['cover_art_cids']),
        'trackCount': json['track_count'],
    };
}

export function PlaylistFullWithoutTracksToJSON(value?: PlaylistFullWithoutTracks | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'artwork': PlaylistArtworkToJSON(value.artwork),
        'description': value.description,
        'permalink': value.permalink,
        'id': value.id,
        'is_album': value.isAlbum,
        'is_image_autogenerated': value.isImageAutogenerated,
        'playlist_name': value.playlistName,
        'playlist_contents': ((value.playlistContents as Array<any>).map(PlaylistAddedTimestampToJSON)),
        'repost_count': value.repostCount,
        'favorite_count': value.favoriteCount,
        'total_play_count': value.totalPlayCount,
        'user': UserFullToJSON(value.user),
        'ddex_app': value.ddexApp,
        'access': AccessToJSON(value.access),
        'blocknumber': value.blocknumber,
        'created_at': value.createdAt,
        'followee_reposts': ((value.followeeReposts as Array<any>).map(RepostToJSON)),
        'followee_favorites': ((value.followeeFavorites as Array<any>).map(FavoriteToJSON)),
        'has_current_user_reposted': value.hasCurrentUserReposted,
        'has_current_user_saved': value.hasCurrentUserSaved,
        'is_delete': value.isDelete,
        'is_private': value.isPrivate,
        'updated_at': value.updatedAt,
        'added_timestamps': ((value.addedTimestamps as Array<any>).map(PlaylistAddedTimestampToJSON)),
        'user_id': value.userId,
        'tracks': value.tracks === undefined ? undefined : ((value.tracks as Array<any>).map(TrackFullToJSON)),
        'cover_art': value.coverArt,
        'cover_art_sizes': value.coverArtSizes,
        'cover_art_cids': PlaylistArtworkToJSON(value.coverArtCids),
        'track_count': value.trackCount,
    };
}

