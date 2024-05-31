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
import type { TrackAccessInfo } from './TrackAccessInfo';
import {
    TrackAccessInfoFromJSON,
    TrackAccessInfoFromJSONTyped,
    TrackAccessInfoToJSON,
} from './TrackAccessInfo';

/**
 * 
 * @export
 * @interface AccessInfoResponse
 */
export interface AccessInfoResponse {
    /**
     * 
     * @type {TrackAccessInfo}
     * @memberof AccessInfoResponse
     */
    data?: TrackAccessInfo;
}

/**
 * Check if a given object implements the AccessInfoResponse interface.
 */
export function instanceOfAccessInfoResponse(value: object): value is AccessInfoResponse {
    let isInstance = true;

    return isInstance;
}

export function AccessInfoResponseFromJSON(json: any): AccessInfoResponse {
    return AccessInfoResponseFromJSONTyped(json, false);
}

export function AccessInfoResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AccessInfoResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : TrackAccessInfoFromJSON(json['data']),
    };
}

export function AccessInfoResponseToJSON(value?: AccessInfoResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': TrackAccessInfoToJSON(value.data),
    };
}
