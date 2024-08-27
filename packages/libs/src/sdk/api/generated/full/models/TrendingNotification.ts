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
import type { TrendingNotificationAction } from './TrendingNotificationAction';
import {
    TrendingNotificationActionFromJSON,
    TrendingNotificationActionFromJSONTyped,
    TrendingNotificationActionToJSON,
} from './TrendingNotificationAction';

/**
 * 
 * @export
 * @interface TrendingNotification
 */
export interface TrendingNotification {
    /**
     * 
     * @type {string}
     * @memberof TrendingNotification
     */
    type: string;
    /**
     * 
     * @type {string}
     * @memberof TrendingNotification
     */
    groupId: string;
    /**
     * 
     * @type {boolean}
     * @memberof TrendingNotification
     */
    isSeen: boolean;
    /**
     * 
     * @type {number}
     * @memberof TrendingNotification
     */
    seenAt?: number;
    /**
     * 
     * @type {Array<TrendingNotificationAction>}
     * @memberof TrendingNotification
     */
    actions: Array<TrendingNotificationAction>;
}

/**
 * Check if a given object implements the TrendingNotification interface.
 */
export function instanceOfTrendingNotification(value: object): value is TrendingNotification {
    let isInstance = true;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "groupId" in value && value["groupId"] !== undefined;
    isInstance = isInstance && "isSeen" in value && value["isSeen"] !== undefined;
    isInstance = isInstance && "actions" in value && value["actions"] !== undefined;

    return isInstance;
}

export function TrendingNotificationFromJSON(json: any): TrendingNotification {
    return TrendingNotificationFromJSONTyped(json, false);
}

export function TrendingNotificationFromJSONTyped(json: any, ignoreDiscriminator: boolean): TrendingNotification {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': json['type'],
        'groupId': json['group_id'],
        'isSeen': json['is_seen'],
        'seenAt': !exists(json, 'seen_at') ? undefined : json['seen_at'],
        'actions': ((json['actions'] as Array<any>).map(TrendingNotificationActionFromJSON)),
    };
}

export function TrendingNotificationToJSON(value?: TrendingNotification | null): any {
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
        'actions': ((value.actions as Array<any>).map(TrendingNotificationActionToJSON)),
    };
}
