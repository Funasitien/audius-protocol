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
import type { Grant } from './Grant';
import {
    GrantFromJSON,
    GrantFromJSONTyped,
    GrantToJSON,
} from './Grant';
import type { UserFull } from './UserFull';
import {
    UserFullFromJSON,
    UserFullFromJSONTyped,
    UserFullToJSON,
} from './UserFull';

/**
 * 
 * @export
 * @interface ManagedUser
 */
export interface ManagedUser {
    /**
     * 
     * @type {UserFull}
     * @memberof ManagedUser
     */
    user: UserFull;
    /**
     * 
     * @type {Grant}
     * @memberof ManagedUser
     */
    grant: Grant;
}

/**
 * Check if a given object implements the ManagedUser interface.
 */
export function instanceOfManagedUser(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "user" in value;
    isInstance = isInstance && "grant" in value;

    return isInstance;
}

export function ManagedUserFromJSON(json: any): ManagedUser {
    return ManagedUserFromJSONTyped(json, false);
}

export function ManagedUserFromJSONTyped(json: any, ignoreDiscriminator: boolean): ManagedUser {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'user': UserFullFromJSON(json['user']),
        'grant': GrantFromJSON(json['grant']),
    };
}

export function ManagedUserToJSON(value?: ManagedUser | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'user': UserFullToJSON(value.user),
        'grant': GrantToJSON(value.grant),
    };
}

