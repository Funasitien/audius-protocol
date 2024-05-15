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
import type { User } from './User';
import {
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
} from './User';

/**
 * 
 * @export
 * @interface Tip
 */
export interface Tip {
    /**
     * 
     * @type {string}
     * @memberof Tip
     */
    amount: string;
    /**
     * 
     * @type {User}
     * @memberof Tip
     */
    sender?: User;
    /**
     * 
     * @type {User}
     * @memberof Tip
     */
    receiver?: User;
    /**
     * 
     * @type {string}
     * @memberof Tip
     */
    createdAt: string;
}

/**
 * Check if a given object implements the Tip interface.
 */
export function instanceOfTip(value: object): value is Tip {
    let isInstance = true;
    isInstance = isInstance && "amount" in value && value["amount"] !== undefined;
    isInstance = isInstance && "createdAt" in value && value["createdAt"] !== undefined;

    return isInstance;
}

export function TipFromJSON(json: any): Tip {
    return TipFromJSONTyped(json, false);
}

export function TipFromJSONTyped(json: any, ignoreDiscriminator: boolean): Tip {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'amount': json['amount'],
        'sender': !exists(json, 'sender') ? undefined : UserFromJSON(json['sender']),
        'receiver': !exists(json, 'receiver') ? undefined : UserFromJSON(json['receiver']),
        'createdAt': json['created_at'],
    };
}

export function TipToJSON(value?: Tip | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'amount': value.amount,
        'sender': UserToJSON(value.sender),
        'receiver': UserToJSON(value.receiver),
        'created_at': value.createdAt,
    };
}

