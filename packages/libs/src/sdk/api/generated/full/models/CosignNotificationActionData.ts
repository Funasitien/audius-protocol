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
 * @interface CosignNotificationActionData
 */
export interface CosignNotificationActionData {
    /**
     * 
     * @type {string}
     * @memberof CosignNotificationActionData
     */
    parentTrackId: string;
    /**
     * 
     * @type {string}
     * @memberof CosignNotificationActionData
     */
    parentTrackOwnerId: string;
    /**
     * 
     * @type {string}
     * @memberof CosignNotificationActionData
     */
    trackId: string;
    /**
     * 
     * @type {string}
     * @memberof CosignNotificationActionData
     */
    trackOwnerId: string;
}

/**
 * Check if a given object implements the CosignNotificationActionData interface.
 */
export function instanceOfCosignNotificationActionData(value: object): value is CosignNotificationActionData {
    let isInstance = true;
    isInstance = isInstance && "parentTrackId" in value && value["parentTrackId"] !== undefined;
    isInstance = isInstance && "parentTrackOwnerId" in value && value["parentTrackOwnerId"] !== undefined;
    isInstance = isInstance && "trackId" in value && value["trackId"] !== undefined;
    isInstance = isInstance && "trackOwnerId" in value && value["trackOwnerId"] !== undefined;

    return isInstance;
}

export function CosignNotificationActionDataFromJSON(json: any): CosignNotificationActionData {
    return CosignNotificationActionDataFromJSONTyped(json, false);
}

export function CosignNotificationActionDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): CosignNotificationActionData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'parentTrackId': json['parent_track_id'],
        'parentTrackOwnerId': json['parent_track_owner_id'],
        'trackId': json['track_id'],
        'trackOwnerId': json['track_owner_id'],
    };
}

export function CosignNotificationActionDataToJSON(value?: CosignNotificationActionData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'parent_track_id': value.parentTrackId,
        'parent_track_owner_id': value.parentTrackOwnerId,
        'track_id': value.trackId,
        'track_owner_id': value.trackOwnerId,
    };
}

