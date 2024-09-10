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

/**
 * 
 * @export
 * @interface TrackFeedItem
 */
export interface TrackFeedItem {
    /**
     * 
     * @type {string}
     * @memberof TrackFeedItem
     */
    type: string;
    /**
     * 
     * @type {TrackFull}
     * @memberof TrackFeedItem
     */
    item: TrackFull;
}

/**
 * Check if a given object implements the TrackFeedItem interface.
 */
export function instanceOfTrackFeedItem(value: object): value is TrackFeedItem {
    let isInstance = true;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "item" in value && value["item"] !== undefined;

    return isInstance;
}

export function TrackFeedItemFromJSON(json: any): TrackFeedItem {
    return TrackFeedItemFromJSONTyped(json, false);
}

export function TrackFeedItemFromJSONTyped(json: any, ignoreDiscriminator: boolean): TrackFeedItem {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': json['type'],
        'item': TrackFullFromJSON(json['item']),
    };
}

export function TrackFeedItemToJSON(value?: TrackFeedItem | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'type': value.type,
        'item': TrackFullToJSON(value.item),
    };
}
