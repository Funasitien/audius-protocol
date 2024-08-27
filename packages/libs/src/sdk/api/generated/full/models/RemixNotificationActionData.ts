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
 * @interface RemixNotificationActionData
 */
export interface RemixNotificationActionData {
    /**
     * 
     * @type {string}
     * @memberof RemixNotificationActionData
     */
    parentTrackId: string;
    /**
     * 
     * @type {string}
     * @memberof RemixNotificationActionData
     */
    trackId: string;
    /**
     * 
     * @type {string}
     * @memberof RemixNotificationActionData
     */
    trackOwnerId: string;
}

/**
 * Check if a given object implements the RemixNotificationActionData interface.
 */
export function instanceOfRemixNotificationActionData(value: object): value is RemixNotificationActionData {
    let isInstance = true;
    isInstance = isInstance && "parentTrackId" in value && value["parentTrackId"] !== undefined;
    isInstance = isInstance && "trackId" in value && value["trackId"] !== undefined;
    isInstance = isInstance && "trackOwnerId" in value && value["trackOwnerId"] !== undefined;

    return isInstance;
}

export function RemixNotificationActionDataFromJSON(json: any): RemixNotificationActionData {
    return RemixNotificationActionDataFromJSONTyped(json, false);
}

export function RemixNotificationActionDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): RemixNotificationActionData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'parentTrackId': json['parent_track_id'],
        'trackId': json['track_id'],
        'trackOwnerId': json['track_owner_id'],
    };
}

export function RemixNotificationActionDataToJSON(value?: RemixNotificationActionData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'parent_track_id': value.parentTrackId,
        'track_id': value.trackId,
        'track_owner_id': value.trackOwnerId,
    };
}
