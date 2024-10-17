/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
/**
 * API
 * Audius V1 API
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { Supporting } from './Supporting';
import {
    SupportingFromJSON,
    SupportingFromJSONTyped,
    SupportingToJSON,
} from './Supporting';

/**
 * 
 * @export
 * @interface GetSupportedUsers
 */
export interface GetSupportedUsers {
    /**
     * 
     * @type {Array<Supporting>}
     * @memberof GetSupportedUsers
     */
    data?: Array<Supporting>;
}

/**
 * Check if a given object implements the GetSupportedUsers interface.
 */
export function instanceOfGetSupportedUsers(value: object): value is GetSupportedUsers {
    let isInstance = true;

    return isInstance;
}

export function GetSupportedUsersFromJSON(json: any): GetSupportedUsers {
    return GetSupportedUsersFromJSONTyped(json, false);
}

export function GetSupportedUsersFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetSupportedUsers {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(SupportingFromJSON)),
    };
}

export function GetSupportedUsersToJSON(value?: GetSupportedUsers | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(SupportingToJSON)),
    };
}
