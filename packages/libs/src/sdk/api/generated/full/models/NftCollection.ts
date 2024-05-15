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
 * @interface NftCollection
 */
export interface NftCollection {
    /**
     * 
     * @type {string}
     * @memberof NftCollection
     */
    chain: NftCollectionChainEnum;
    /**
     * 
     * @type {string}
     * @memberof NftCollection
     */
    address: string;
    /**
     * 
     * @type {string}
     * @memberof NftCollection
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof NftCollection
     */
    imageUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof NftCollection
     */
    externalLink?: string;
}


/**
 * @export
 */
export const NftCollectionChainEnum = {
    Eth: 'eth',
    Sol: 'sol'
} as const;
export type NftCollectionChainEnum = typeof NftCollectionChainEnum[keyof typeof NftCollectionChainEnum];


/**
 * Check if a given object implements the NftCollection interface.
 */
export function instanceOfNftCollection(value: object): value is NftCollection {
    let isInstance = true;
    isInstance = isInstance && "chain" in value && value["chain"] !== undefined;
    isInstance = isInstance && "address" in value && value["address"] !== undefined;
    isInstance = isInstance && "name" in value && value["name"] !== undefined;

    return isInstance;
}

export function NftCollectionFromJSON(json: any): NftCollection {
    return NftCollectionFromJSONTyped(json, false);
}

export function NftCollectionFromJSONTyped(json: any, ignoreDiscriminator: boolean): NftCollection {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'chain': json['chain'],
        'address': json['address'],
        'name': json['name'],
        'imageUrl': !exists(json, 'imageUrl') ? undefined : json['imageUrl'],
        'externalLink': !exists(json, 'externalLink') ? undefined : json['externalLink'],
    };
}

export function NftCollectionToJSON(value?: NftCollection | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'chain': value.chain,
        'address': value.address,
        'name': value.name,
        'imageUrl': value.imageUrl,
        'externalLink': value.externalLink,
    };
}

