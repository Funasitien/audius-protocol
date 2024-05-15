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
import type { DeveloperApp } from './DeveloperApp';
import {
    DeveloperAppFromJSON,
    DeveloperAppFromJSONTyped,
    DeveloperAppToJSON,
} from './DeveloperApp';

/**
 * 
 * @export
 * @interface DeveloperApps
 */
export interface DeveloperApps {
    /**
     * 
     * @type {Array<DeveloperApp>}
     * @memberof DeveloperApps
     */
    data?: Array<DeveloperApp>;
}

/**
 * Check if a given object implements the DeveloperApps interface.
 */
export function instanceOfDeveloperApps(value: object): value is DeveloperApps {
    let isInstance = true;

    return isInstance;
}

export function DeveloperAppsFromJSON(json: any): DeveloperApps {
    return DeveloperAppsFromJSONTyped(json, false);
}

export function DeveloperAppsFromJSONTyped(json: any, ignoreDiscriminator: boolean): DeveloperApps {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(DeveloperAppFromJSON)),
    };
}

export function DeveloperAppsToJSON(value?: DeveloperApps | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(DeveloperAppToJSON)),
    };
}

