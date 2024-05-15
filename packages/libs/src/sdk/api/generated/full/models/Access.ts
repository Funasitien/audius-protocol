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
 * @interface Access
 */
export interface Access {
    /**
     * 
     * @type {boolean}
     * @memberof Access
     */
    stream?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof Access
     */
    download?: boolean;
}

/**
 * Check if a given object implements the Access interface.
 */
export function instanceOfAccess(value: object): value is Access {
    let isInstance = true;

    return isInstance;
}

export function AccessFromJSON(json: any): Access {
    return AccessFromJSONTyped(json, false);
}

export function AccessFromJSONTyped(json: any, ignoreDiscriminator: boolean): Access {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'stream': !exists(json, 'stream') ? undefined : json['stream'],
        'download': !exists(json, 'download') ? undefined : json['download'],
    };
}

export function AccessToJSON(value?: Access | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'stream': value.stream,
        'download': value.download,
    };
}

