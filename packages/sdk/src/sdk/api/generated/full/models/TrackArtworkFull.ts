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
 * @interface TrackArtworkFull
 */
export interface TrackArtworkFull {
    /**
     * 
     * @type {string}
     * @memberof TrackArtworkFull
     */
    _150x150?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackArtworkFull
     */
    _480x480?: string;
    /**
     * 
     * @type {string}
     * @memberof TrackArtworkFull
     */
    _1000x1000?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof TrackArtworkFull
     */
    mirrors?: Array<string>;
}

/**
 * Check if a given object implements the TrackArtworkFull interface.
 */
export function instanceOfTrackArtworkFull(value: object): value is TrackArtworkFull {
    let isInstance = true;

    return isInstance;
}

export function TrackArtworkFullFromJSON(json: any): TrackArtworkFull {
    return TrackArtworkFullFromJSONTyped(json, false);
}

export function TrackArtworkFullFromJSONTyped(json: any, ignoreDiscriminator: boolean): TrackArtworkFull {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        '_150x150': !exists(json, '150x150') ? undefined : json['150x150'],
        '_480x480': !exists(json, '480x480') ? undefined : json['480x480'],
        '_1000x1000': !exists(json, '1000x1000') ? undefined : json['1000x1000'],
        'mirrors': !exists(json, 'mirrors') ? undefined : json['mirrors'],
    };
}

export function TrackArtworkFullToJSON(value?: TrackArtworkFull | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        '150x150': value._150x150,
        '480x480': value._480x480,
        '1000x1000': value._1000x1000,
        'mirrors': value.mirrors,
    };
}
