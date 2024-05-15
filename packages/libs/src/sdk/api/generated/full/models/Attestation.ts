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
 * @interface Attestation
 */
export interface Attestation {
    /**
     * 
     * @type {string}
     * @memberof Attestation
     */
    ownerWallet: string;
    /**
     * 
     * @type {string}
     * @memberof Attestation
     */
    attestation: string;
}

/**
 * Check if a given object implements the Attestation interface.
 */
export function instanceOfAttestation(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "ownerWallet" in value && value["ownerWallet"] !== undefined;
    isInstance = isInstance && "attestation" in value && value["attestation"] !== undefined;

    return isInstance;
}

export function AttestationFromJSON(json: any): Attestation {
    return AttestationFromJSONTyped(json, false);
}

export function AttestationFromJSONTyped(json: any, ignoreDiscriminator: boolean): Attestation {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'ownerWallet': json['owner_wallet'],
        'attestation': json['attestation'],
    };
}

export function AttestationToJSON(value?: Attestation | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'owner_wallet': value.ownerWallet,
        'attestation': value.attestation,
    };
}

