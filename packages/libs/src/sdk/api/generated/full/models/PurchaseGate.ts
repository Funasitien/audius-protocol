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
import type { UsdcGate } from './UsdcGate';
import {
    UsdcGateFromJSON,
    UsdcGateFromJSONTyped,
    UsdcGateToJSON,
} from './UsdcGate';

/**
 * 
 * @export
 * @interface PurchaseGate
 */
export interface PurchaseGate {
    /**
     * Must pay the total price and split to the given addresses to unlock
     * @type {UsdcGate}
     * @memberof PurchaseGate
     */
    usdcPurchase: UsdcGate;
}

/**
 * Check if a given object implements the PurchaseGate interface.
 */
export function instanceOfPurchaseGate(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "usdcPurchase" in value && value["usdcPurchase"] !== undefined;

    return isInstance;
}

export function PurchaseGateFromJSON(json: any): PurchaseGate {
    return PurchaseGateFromJSONTyped(json, false);
}

export function PurchaseGateFromJSONTyped(json: any, ignoreDiscriminator: boolean): PurchaseGate {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'usdcPurchase': UsdcGateFromJSON(json['usdc_purchase']),
    };
}

export function PurchaseGateToJSON(value?: PurchaseGate | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'usdc_purchase': UsdcGateToJSON(value.usdcPurchase),
    };
}

