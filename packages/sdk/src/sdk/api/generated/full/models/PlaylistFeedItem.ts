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
import type { PlaylistFull } from './PlaylistFull';
import {
    PlaylistFullFromJSON,
    PlaylistFullFromJSONTyped,
    PlaylistFullToJSON,
} from './PlaylistFull';

/**
 * 
 * @export
 * @interface PlaylistFeedItem
 */
export interface PlaylistFeedItem {
    /**
     * 
     * @type {string}
     * @memberof PlaylistFeedItem
     */
    type: string;
    /**
     * 
     * @type {PlaylistFull}
     * @memberof PlaylistFeedItem
     */
    item: PlaylistFull;
}

/**
 * Check if a given object implements the PlaylistFeedItem interface.
 */
export function instanceOfPlaylistFeedItem(value: object): value is PlaylistFeedItem {
    let isInstance = true;
    isInstance = isInstance && "type" in value && value["type"] !== undefined;
    isInstance = isInstance && "item" in value && value["item"] !== undefined;

    return isInstance;
}

export function PlaylistFeedItemFromJSON(json: any): PlaylistFeedItem {
    return PlaylistFeedItemFromJSONTyped(json, false);
}

export function PlaylistFeedItemFromJSONTyped(json: any, ignoreDiscriminator: boolean): PlaylistFeedItem {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': json['type'],
        'item': PlaylistFullFromJSON(json['item']),
    };
}

export function PlaylistFeedItemToJSON(value?: PlaylistFeedItem | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'type': value.type,
        'item': PlaylistFullToJSON(value.item),
    };
}

