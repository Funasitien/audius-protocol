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
import type { TastemakerNotificationActionData } from './TastemakerNotificationActionData';
import {
    TastemakerNotificationActionDataFromJSON,
    TastemakerNotificationActionDataFromJSONTyped,
    TastemakerNotificationActionDataToJSON,
} from './TastemakerNotificationActionData';

/**
 * 
 * @export
 * @interface TastemakerNotificationAction
 */
export interface TastemakerNotificationAction {
    /**
     * 
     * @type {string}
     * @memberof TastemakerNotificationAction
     */
    specifier: string;
    /**
     * 
     * @type {string}
     * @memberof TastemakerNotificationAction
     */
    type: string;
    /**
     * 
     * @type {number}
     * @memberof TastemakerNotificationAction
     */
    timestamp: number;
    /**
     * 
     * @type {TastemakerNotificationActionData}
     * @memberof TastemakerNotificationAction
     */
    data: TastemakerNotificationActionData;
}

/**
 * Check if a given object implements the TastemakerNotificationAction interface.
 */
export function instanceOfTastemakerNotificationAction(value: object): value is TastemakerNotificationAction {
    let isInstance = true;
    isInstance = isInstance && "specifier" in value && value["specifier"] !== undefined;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "timestamp" in value && value["timestamp"] !== undefined;
    isInstance = isInstance && "data" in value && value["data"] !== undefined;

    return isInstance;
}

export function TastemakerNotificationActionFromJSON(json: any): TastemakerNotificationAction {
    return TastemakerNotificationActionFromJSONTyped(json, false);
}

export function TastemakerNotificationActionFromJSONTyped(json: any, ignoreDiscriminator: boolean): TastemakerNotificationAction {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'specifier': json['specifier'],
        'type': json['type'],
        'timestamp': json['timestamp'],
        'data': TastemakerNotificationActionDataFromJSON(json['data']),
    };
}

export function TastemakerNotificationActionToJSON(value?: TastemakerNotificationAction | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'specifier': value.specifier,
        'type': value.type,
        'timestamp': value.timestamp,
        'data': TastemakerNotificationActionDataToJSON(value.data),
    };
}
