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
import type { ApproveManagerRequestNotificationActionData } from './ApproveManagerRequestNotificationActionData';
import {
    ApproveManagerRequestNotificationActionDataFromJSON,
    ApproveManagerRequestNotificationActionDataFromJSONTyped,
    ApproveManagerRequestNotificationActionDataToJSON,
} from './ApproveManagerRequestNotificationActionData';

/**
 * 
 * @export
 * @interface ApproveManagerRequestNotificationAction
 */
export interface ApproveManagerRequestNotificationAction {
    /**
     * 
     * @type {string}
     * @memberof ApproveManagerRequestNotificationAction
     */
    specifier: string;
    /**
     * 
     * @type {string}
     * @memberof ApproveManagerRequestNotificationAction
     */
    type: string;
    /**
     * 
     * @type {number}
     * @memberof ApproveManagerRequestNotificationAction
     */
    timestamp: number;
    /**
     * 
     * @type {ApproveManagerRequestNotificationActionData}
     * @memberof ApproveManagerRequestNotificationAction
     */
    data: ApproveManagerRequestNotificationActionData;
}

/**
 * Check if a given object implements the ApproveManagerRequestNotificationAction interface.
 */
export function instanceOfApproveManagerRequestNotificationAction(value: object): value is ApproveManagerRequestNotificationAction {
    let isInstance = true;
    isInstance = isInstance && "specifier" in value && value["specifier"] !== undefined;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "timestamp" in value && value["timestamp"] !== undefined;
    isInstance = isInstance && "data" in value && value["data"] !== undefined;

    return isInstance;
}

export function ApproveManagerRequestNotificationActionFromJSON(json: any): ApproveManagerRequestNotificationAction {
    return ApproveManagerRequestNotificationActionFromJSONTyped(json, false);
}

export function ApproveManagerRequestNotificationActionFromJSONTyped(json: any, ignoreDiscriminator: boolean): ApproveManagerRequestNotificationAction {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'specifier': json['specifier'],
        'type': json['type'],
        'timestamp': json['timestamp'],
        'data': ApproveManagerRequestNotificationActionDataFromJSON(json['data']),
    };
}

export function ApproveManagerRequestNotificationActionToJSON(value?: ApproveManagerRequestNotificationAction | null): any {
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
        'data': ApproveManagerRequestNotificationActionDataToJSON(value.data),
    };
}

