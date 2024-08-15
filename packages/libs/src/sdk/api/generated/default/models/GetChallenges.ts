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
import type { ChallengeResponse } from './ChallengeResponse';
import {
    ChallengeResponseFromJSON,
    ChallengeResponseFromJSONTyped,
    ChallengeResponseToJSON,
} from './ChallengeResponse';

/**
 * 
 * @export
 * @interface GetChallenges
 */
export interface GetChallenges {
    /**
     * 
     * @type {Array<ChallengeResponse>}
     * @memberof GetChallenges
     */
    data?: Array<ChallengeResponse>;
}

/**
 * Check if a given object implements the GetChallenges interface.
 */
export function instanceOfGetChallenges(value: object): value is GetChallenges {
    let isInstance = true;

    return isInstance;
}

export function GetChallengesFromJSON(json: any): GetChallenges {
    return GetChallengesFromJSONTyped(json, false);
}

export function GetChallengesFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetChallenges {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(ChallengeResponseFromJSON)),
    };
}

export function GetChallengesToJSON(value?: GetChallenges | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(ChallengeResponseToJSON)),
    };
}

