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
import type { TrackFull } from './TrackFull';
import {
    TrackFullFromJSON,
    TrackFullFromJSONTyped,
    TrackFullToJSON,
} from './TrackFull';
import type { VersionMetadata } from './VersionMetadata';
import {
    VersionMetadataFromJSON,
    VersionMetadataFromJSONTyped,
    VersionMetadataToJSON,
} from './VersionMetadata';

/**
 * 
 * @export
 * @interface FullTrackResponse
 */
export interface FullTrackResponse {
    /**
     * 
     * @type {number}
     * @memberof FullTrackResponse
     */
    latestChainBlock: number;
    /**
     * 
     * @type {number}
     * @memberof FullTrackResponse
     */
    latestIndexedBlock: number;
    /**
     * 
     * @type {number}
     * @memberof FullTrackResponse
     */
    latestChainSlotPlays: number;
    /**
     * 
     * @type {number}
     * @memberof FullTrackResponse
     */
    latestIndexedSlotPlays: number;
    /**
     * 
     * @type {string}
     * @memberof FullTrackResponse
     */
    signature: string;
    /**
     * 
     * @type {string}
     * @memberof FullTrackResponse
     */
    timestamp: string;
    /**
     * 
     * @type {VersionMetadata}
     * @memberof FullTrackResponse
     */
    version: VersionMetadata;
    /**
     * 
     * @type {TrackFull}
     * @memberof FullTrackResponse
     */
    data?: TrackFull;
}

/**
 * Check if a given object implements the FullTrackResponse interface.
 */
export function instanceOfFullTrackResponse(value: object): value is FullTrackResponse {
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

export function FullTrackResponseFromJSON(json: any): FullTrackResponse {
    return FullTrackResponseFromJSONTyped(json, false);
}

export function FullTrackResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): FullTrackResponse {
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
        'data': !exists(json, 'data') ? undefined : TrackFullFromJSON(json['data']),
    };
}

export function FullTrackResponseToJSON(value?: FullTrackResponse | null): any {
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
        'data': TrackFullToJSON(value.data),
    };
}
