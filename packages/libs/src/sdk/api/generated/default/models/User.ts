/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
/**
 * API
 * Audius V1 API
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { CoverPhoto } from './CoverPhoto';
import {
    CoverPhotoFromJSON,
    CoverPhotoFromJSONTyped,
    CoverPhotoToJSON,
} from './CoverPhoto';
import type { ProfilePicture } from './ProfilePicture';
import {
    ProfilePictureFromJSON,
    ProfilePictureFromJSONTyped,
    ProfilePictureToJSON,
} from './ProfilePicture';

/**
 * 
 * @export
 * @interface User
 */
export interface User {
    /**
     * 
     * @type {number}
     * @memberof User
     */
    albumCount: number;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    artistPickTrackId?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    bio?: string;
    /**
     * 
     * @type {CoverPhoto}
     * @memberof User
     */
    coverPhoto?: CoverPhoto;
    /**
     * 
     * @type {number}
     * @memberof User
     */
    followeeCount: number;
    /**
     * 
     * @type {number}
     * @memberof User
     */
    followerCount: number;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    handle: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    id: string;
    /**
     * 
     * @type {boolean}
     * @memberof User
     */
    isVerified: boolean;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    location?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof User
     */
    playlistCount: number;
    /**
     * 
     * @type {ProfilePicture}
     * @memberof User
     */
    profilePicture?: ProfilePicture;
    /**
     * 
     * @type {number}
     * @memberof User
     */
    repostCount: number;
    /**
     * 
     * @type {number}
     * @memberof User
     */
    trackCount: number;
    /**
     * 
     * @type {boolean}
     * @memberof User
     */
    isDeactivated: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof User
     */
    isAvailable: boolean;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    ercWallet: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    splWallet: string;
    /**
     * 
     * @type {number}
     * @memberof User
     */
    supporterCount: number;
    /**
     * 
     * @type {number}
     * @memberof User
     */
    supportingCount: number;
    /**
     * 
     * @type {number}
     * @memberof User
     */
    totalAudioBalance: number;
    /**
     * The user's Ethereum wallet address for their account
     * @type {string}
     * @memberof User
     */
    wallet: string;
}

/**
 * Check if a given object implements the User interface.
 */
export function instanceOfUser(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "albumCount" in value && value["albumCount"] !== undefined;
    isInstance = isInstance && "followeeCount" in value && value["followeeCount"] !== undefined;
    isInstance = isInstance && "followerCount" in value && value["followerCount"] !== undefined;
    isInstance = isInstance && "handle" in value && value["handle"] !== undefined;
    isInstance = isInstance && "id" in value && value["id"] !== undefined;
    isInstance = isInstance && "isVerified" in value && value["isVerified"] !== undefined;
    isInstance = isInstance && "name" in value && value["name"] !== undefined;
    isInstance = isInstance && "playlistCount" in value && value["playlistCount"] !== undefined;
    isInstance = isInstance && "repostCount" in value && value["repostCount"] !== undefined;
    isInstance = isInstance && "trackCount" in value && value["trackCount"] !== undefined;
    isInstance = isInstance && "isDeactivated" in value && value["isDeactivated"] !== undefined;
    isInstance = isInstance && "isAvailable" in value && value["isAvailable"] !== undefined;
    isInstance = isInstance && "ercWallet" in value && value["ercWallet"] !== undefined;
    isInstance = isInstance && "splWallet" in value && value["splWallet"] !== undefined;
    isInstance = isInstance && "supporterCount" in value && value["supporterCount"] !== undefined;
    isInstance = isInstance && "supportingCount" in value && value["supportingCount"] !== undefined;
    isInstance = isInstance && "totalAudioBalance" in value && value["totalAudioBalance"] !== undefined;
    isInstance = isInstance && "wallet" in value && value["wallet"] !== undefined;

    return isInstance;
}

export function UserFromJSON(json: any): User {
    return UserFromJSONTyped(json, false);
}

export function UserFromJSONTyped(json: any, ignoreDiscriminator: boolean): User {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'albumCount': json['album_count'],
        'artistPickTrackId': !exists(json, 'artist_pick_track_id') ? undefined : json['artist_pick_track_id'],
        'bio': !exists(json, 'bio') ? undefined : json['bio'],
        'coverPhoto': !exists(json, 'cover_photo') ? undefined : CoverPhotoFromJSON(json['cover_photo']),
        'followeeCount': json['followee_count'],
        'followerCount': json['follower_count'],
        'handle': json['handle'],
        'id': json['id'],
        'isVerified': json['is_verified'],
        'location': !exists(json, 'location') ? undefined : json['location'],
        'name': json['name'],
        'playlistCount': json['playlist_count'],
        'profilePicture': !exists(json, 'profile_picture') ? undefined : ProfilePictureFromJSON(json['profile_picture']),
        'repostCount': json['repost_count'],
        'trackCount': json['track_count'],
        'isDeactivated': json['is_deactivated'],
        'isAvailable': json['is_available'],
        'ercWallet': json['erc_wallet'],
        'splWallet': json['spl_wallet'],
        'supporterCount': json['supporter_count'],
        'supportingCount': json['supporting_count'],
        'totalAudioBalance': json['total_audio_balance'],
        'wallet': json['wallet'],
    };
}

export function UserToJSON(value?: User | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'album_count': value.albumCount,
        'artist_pick_track_id': value.artistPickTrackId,
        'bio': value.bio,
        'cover_photo': CoverPhotoToJSON(value.coverPhoto),
        'followee_count': value.followeeCount,
        'follower_count': value.followerCount,
        'handle': value.handle,
        'id': value.id,
        'is_verified': value.isVerified,
        'location': value.location,
        'name': value.name,
        'playlist_count': value.playlistCount,
        'profile_picture': ProfilePictureToJSON(value.profilePicture),
        'repost_count': value.repostCount,
        'track_count': value.trackCount,
        'is_deactivated': value.isDeactivated,
        'is_available': value.isAvailable,
        'erc_wallet': value.ercWallet,
        'spl_wallet': value.splWallet,
        'supporter_count': value.supporterCount,
        'supporting_count': value.supportingCount,
        'total_audio_balance': value.totalAudioBalance,
        'wallet': value.wallet,
    };
}

