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
import type { TrackAddedToPurchasedAlbumNotificationAction } from './TrackAddedToPurchasedAlbumNotificationAction';
import {
    TrackAddedToPurchasedAlbumNotificationActionFromJSON,
    TrackAddedToPurchasedAlbumNotificationActionFromJSONTyped,
    TrackAddedToPurchasedAlbumNotificationActionToJSON,
} from './TrackAddedToPurchasedAlbumNotificationAction';

/**
 * 
 * @export
 * @interface TrackAddedToPurchasedAlbumNotification
 */
export interface TrackAddedToPurchasedAlbumNotification {
    /**
     * 
     * @type {string}
     * @memberof TrackAddedToPurchasedAlbumNotification
     */
    type: string;
    /**
     * 
     * @type {string}
     * @memberof TrackAddedToPurchasedAlbumNotification
     */
    groupId: string;
    /**
     * 
     * @type {boolean}
     * @memberof TrackAddedToPurchasedAlbumNotification
     */
    isSeen: boolean;
    /**
     * 
     * @type {number}
     * @memberof TrackAddedToPurchasedAlbumNotification
     */
    seenAt?: number;
    /**
     * 
     * @type {Array<TrackAddedToPurchasedAlbumNotificationAction>}
     * @memberof TrackAddedToPurchasedAlbumNotification
     */
    actions: Array<TrackAddedToPurchasedAlbumNotificationAction>;
}

/**
 * Check if a given object implements the TrackAddedToPurchasedAlbumNotification interface.
 */
export function instanceOfTrackAddedToPurchasedAlbumNotification(value: object): value is TrackAddedToPurchasedAlbumNotification {
    let isInstance = true;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "groupId" in value && value["groupId"] !== undefined;
    isInstance = isInstance && "isSeen" in value && value["isSeen"] !== undefined;
    isInstance = isInstance && "actions" in value && value["actions"] !== undefined;

    return isInstance;
}

export function TrackAddedToPurchasedAlbumNotificationFromJSON(json: any): TrackAddedToPurchasedAlbumNotification {
    return TrackAddedToPurchasedAlbumNotificationFromJSONTyped(json, false);
}

export function TrackAddedToPurchasedAlbumNotificationFromJSONTyped(json: any, ignoreDiscriminator: boolean): TrackAddedToPurchasedAlbumNotification {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': json['type'],
        'groupId': json['group_id'],
        'isSeen': json['is_seen'],
        'seenAt': !exists(json, 'seen_at') ? undefined : json['seen_at'],
        'actions': ((json['actions'] as Array<any>).map(TrackAddedToPurchasedAlbumNotificationActionFromJSON)),
    };
}

export function TrackAddedToPurchasedAlbumNotificationToJSON(value?: TrackAddedToPurchasedAlbumNotification | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'type': value.type,
        'group_id': value.groupId,
        'is_seen': value.isSeen,
        'seen_at': value.seenAt,
        'actions': ((value.actions as Array<any>).map(TrackAddedToPurchasedAlbumNotificationActionToJSON)),
    };
}
