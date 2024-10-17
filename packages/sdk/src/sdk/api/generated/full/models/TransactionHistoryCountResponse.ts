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
import type { VersionMetadata } from './VersionMetadata';
import {
    VersionMetadataFromJSON,
    VersionMetadataFromJSONTyped,
    VersionMetadataToJSON,
} from './VersionMetadata';

/**
 * 
 * @export
 * @interface TransactionHistoryCountResponse
 */
export interface TransactionHistoryCountResponse {
    /**
     * 
     * @type {number}
     * @memberof TransactionHistoryCountResponse
     */
    latestChainBlock: number;
    /**
     * 
     * @type {number}
     * @memberof TransactionHistoryCountResponse
     */
    latestIndexedBlock: number;
    /**
     * 
     * @type {number}
     * @memberof TransactionHistoryCountResponse
     */
    latestChainSlotPlays: number;
    /**
     * 
     * @type {number}
     * @memberof TransactionHistoryCountResponse
     */
    latestIndexedSlotPlays: number;
    /**
     * 
     * @type {string}
     * @memberof TransactionHistoryCountResponse
     */
    signature: string;
    /**
     * 
     * @type {string}
     * @memberof TransactionHistoryCountResponse
     */
    timestamp: string;
    /**
     * 
     * @type {VersionMetadata}
     * @memberof TransactionHistoryCountResponse
     */
    version: VersionMetadata;
    /**
     * 
     * @type {number}
     * @memberof TransactionHistoryCountResponse
     */
    data?: number;
}

/**
 * Check if a given object implements the TransactionHistoryCountResponse interface.
 */
export function instanceOfTransactionHistoryCountResponse(value: object): value is TransactionHistoryCountResponse {
    let isInstance = true;
    isInstance = isInstance && "latestChainBlock" in value && value["latestChainBlock"] !== undefined;
    isInstance = isInstance && "latestIndexedBlock" in value && value["latestIndexedBlock"] !== undefined;
    isInstance = isInstance && "latestChainSlotPlays" in value && value["latestChainSlotPlays"] !== undefined;
    isInstance = isInstance && "latestIndexedSlotPlays" in value && value["latestIndexedSlotPlays"] !== undefined;
    isInstance = isInstance && "signature" in value && value["signature"] !== undefined;
    isInstance = isInstance && "timestamp" in value && value["timestamp"] !== undefined;
    isInstance = isInstance && "version" in value && value["version"] !== undefined;

    return isInstance;
}

export function TransactionHistoryCountResponseFromJSON(json: any): TransactionHistoryCountResponse {
    return TransactionHistoryCountResponseFromJSONTyped(json, false);
}

export function TransactionHistoryCountResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): TransactionHistoryCountResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'latestChainBlock': json['latest_chain_block'],
        'latestIndexedBlock': json['latest_indexed_block'],
        'latestChainSlotPlays': json['latest_chain_slot_plays'],
        'latestIndexedSlotPlays': json['latest_indexed_slot_plays'],
        'signature': json['signature'],
        'timestamp': json['timestamp'],
        'version': VersionMetadataFromJSON(json['version']),
        'data': !exists(json, 'data') ? undefined : json['data'],
    };
}

export function TransactionHistoryCountResponseToJSON(value?: TransactionHistoryCountResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'latest_chain_block': value.latestChainBlock,
        'latest_indexed_block': value.latestIndexedBlock,
        'latest_chain_slot_plays': value.latestChainSlotPlays,
        'latest_indexed_slot_plays': value.latestIndexedSlotPlays,
        'signature': value.signature,
        'timestamp': value.timestamp,
        'version': VersionMetadataToJSON(value.version),
        'data': value.data,
    };
}
