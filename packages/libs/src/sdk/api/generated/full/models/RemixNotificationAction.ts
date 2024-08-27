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
import type { RemixNotificationActionData } from './RemixNotificationActionData';
import {
    RemixNotificationActionDataFromJSON,
    RemixNotificationActionDataFromJSONTyped,
    RemixNotificationActionDataToJSON,
} from './RemixNotificationActionData';

/**
 * 
 * @export
 * @interface RemixNotificationAction
 */
export interface RemixNotificationAction {
    /**
     * 
     * @type {string}
     * @memberof RemixNotificationAction
     */
    specifier: string;
    /**
     * 
     * @type {string}
     * @memberof RemixNotificationAction
     */
    type: string;
    /**
     * 
     * @type {number}
     * @memberof RemixNotificationAction
     */
    timestamp: number;
    /**
     * 
     * @type {RemixNotificationActionData}
     * @memberof RemixNotificationAction
     */
    data: RemixNotificationActionData;
}

/**
 * Check if a given object implements the RemixNotificationAction interface.
 */
export function instanceOfRemixNotificationAction(value: object): value is RemixNotificationAction {
    let isInstance = true;
    isInstance = isInstance && "specifier" in value && value["specifier"] !== undefined;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "timestamp" in value && value["timestamp"] !== undefined;
    isInstance = isInstance && "data" in value && value["data"] !== undefined;

    return isInstance;
}

export function RemixNotificationActionFromJSON(json: any): RemixNotificationAction {
    return RemixNotificationActionFromJSONTyped(json, false);
}

export function RemixNotificationActionFromJSONTyped(json: any, ignoreDiscriminator: boolean): RemixNotificationAction {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'specifier': json['specifier'],
        'type': json['type'],
        'timestamp': json['timestamp'],
        'data': RemixNotificationActionDataFromJSON(json['data']),
    };
}

export function RemixNotificationActionToJSON(value?: RemixNotificationAction | null): any {
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
        'data': RemixNotificationActionDataToJSON(value.data),
    };
}
