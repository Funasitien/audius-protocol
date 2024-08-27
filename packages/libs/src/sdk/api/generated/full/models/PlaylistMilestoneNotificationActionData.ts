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
/**
 * 
 * @export
 * @interface PlaylistMilestoneNotificationActionData
 */
export interface PlaylistMilestoneNotificationActionData {
    /**
     * 
     * @type {string}
     * @memberof PlaylistMilestoneNotificationActionData
     */
    type: string;
    /**
     * 
     * @type {number}
     * @memberof PlaylistMilestoneNotificationActionData
     */
    threshold: number;
    /**
     * 
     * @type {string}
     * @memberof PlaylistMilestoneNotificationActionData
     */
    playlistId: string;
    /**
     * 
     * @type {boolean}
     * @memberof PlaylistMilestoneNotificationActionData
     */
    isAlbum: boolean;
}

/**
 * Check if a given object implements the PlaylistMilestoneNotificationActionData interface.
 */
export function instanceOfPlaylistMilestoneNotificationActionData(value: object): value is PlaylistMilestoneNotificationActionData {
    let isInstance = true;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "threshold" in value && value["threshold"] !== undefined;
    isInstance = isInstance && "playlistId" in value && value["playlistId"] !== undefined;
    isInstance = isInstance && "isAlbum" in value && value["isAlbum"] !== undefined;

    return isInstance;
}

export function PlaylistMilestoneNotificationActionDataFromJSON(json: any): PlaylistMilestoneNotificationActionData {
    return PlaylistMilestoneNotificationActionDataFromJSONTyped(json, false);
}

export function PlaylistMilestoneNotificationActionDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): PlaylistMilestoneNotificationActionData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': json['type'],
        'threshold': json['threshold'],
        'playlistId': json['playlist_id'],
        'isAlbum': json['is_album'],
    };
}

export function PlaylistMilestoneNotificationActionDataToJSON(value?: PlaylistMilestoneNotificationActionData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'type': value.type,
        'threshold': value.threshold,
        'playlist_id': value.playlistId,
        'is_album': value.isAlbum,
    };
}
