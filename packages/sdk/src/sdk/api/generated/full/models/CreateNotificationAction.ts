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
import type { CreateNotificationActionData } from './CreateNotificationActionData';
import {
    CreateNotificationActionDataFromJSON,
    CreateNotificationActionDataFromJSONTyped,
    CreateNotificationActionDataToJSON,
} from './CreateNotificationActionData';

/**
 * 
 * @export
 * @interface CreateNotificationAction
 */
export interface CreateNotificationAction {
    /**
     * 
     * @type {string}
     * @memberof CreateNotificationAction
     */
    specifier: string;
    /**
     * 
     * @type {string}
     * @memberof CreateNotificationAction
     */
    type: string;
    /**
     * 
     * @type {number}
     * @memberof CreateNotificationAction
     */
    timestamp: number;
    /**
     * 
     * @type {CreateNotificationActionData}
     * @memberof CreateNotificationAction
     */
    data: CreateNotificationActionData;
}

/**
 * Check if a given object implements the CreateNotificationAction interface.
 */
export function instanceOfCreateNotificationAction(value: object): value is CreateNotificationAction {
    let isInstance = true;
    isInstance = isInstance && "specifier" in value && value["specifier"] !== undefined;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "timestamp" in value && value["timestamp"] !== undefined;
    isInstance = isInstance && "data" in value && value["data"] !== undefined;

    return isInstance;
}

export function CreateNotificationActionFromJSON(json: any): CreateNotificationAction {
    return CreateNotificationActionFromJSONTyped(json, false);
}

export function CreateNotificationActionFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateNotificationAction {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'specifier': json['specifier'],
        'type': json['type'],
        'timestamp': json['timestamp'],
        'data': CreateNotificationActionDataFromJSON(json['data']),
    };
}

export function CreateNotificationActionToJSON(value?: CreateNotificationAction | null): any {
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
        'data': CreateNotificationActionDataToJSON(value.data),
    };
}
