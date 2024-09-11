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
import type { ReceiveTipNotificationActionData } from './ReceiveTipNotificationActionData';
import {
    ReceiveTipNotificationActionDataFromJSON,
    ReceiveTipNotificationActionDataFromJSONTyped,
    ReceiveTipNotificationActionDataToJSON,
} from './ReceiveTipNotificationActionData';

/**
 * 
 * @export
 * @interface ReceiveTipNotificationAction
 */
export interface ReceiveTipNotificationAction {
    /**
     * 
     * @type {string}
     * @memberof ReceiveTipNotificationAction
     */
    specifier: string;
    /**
     * 
     * @type {string}
     * @memberof ReceiveTipNotificationAction
     */
    type: string;
    /**
     * 
     * @type {number}
     * @memberof ReceiveTipNotificationAction
     */
    timestamp: number;
    /**
     * 
     * @type {ReceiveTipNotificationActionData}
     * @memberof ReceiveTipNotificationAction
     */
    data: ReceiveTipNotificationActionData;
}

/**
 * Check if a given object implements the ReceiveTipNotificationAction interface.
 */
export function instanceOfReceiveTipNotificationAction(value: object): value is ReceiveTipNotificationAction {
    let isInstance = true;
    isInstance = isInstance && "specifier" in value && value["specifier"] !== undefined;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "timestamp" in value && value["timestamp"] !== undefined;
    isInstance = isInstance && "data" in value && value["data"] !== undefined;

    return isInstance;
}

export function ReceiveTipNotificationActionFromJSON(json: any): ReceiveTipNotificationAction {
    return ReceiveTipNotificationActionFromJSONTyped(json, false);
}

export function ReceiveTipNotificationActionFromJSONTyped(json: any, ignoreDiscriminator: boolean): ReceiveTipNotificationAction {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'specifier': json['specifier'],
        'type': json['type'],
        'timestamp': json['timestamp'],
        'data': ReceiveTipNotificationActionDataFromJSON(json['data']),
    };
}

export function ReceiveTipNotificationActionToJSON(value?: ReceiveTipNotificationAction | null): any {
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
        'data': ReceiveTipNotificationActionDataToJSON(value.data),
    };
}

