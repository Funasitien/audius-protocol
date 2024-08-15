/* tslint:disable */
// @ts-nocheck
/* eslint-disable */
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


import * as runtime from '../runtime';
import type {
  UndisbursedChallenges,
} from '../models';
import {
    UndisbursedChallengesFromJSON,
    UndisbursedChallengesToJSON,
} from '../models';

export interface GetUndisbursedChallengesRequest {
    offset?: number;
    limit?: number;
    userId?: string;
    completedBlocknumber?: number;
}

/**
 * 
 */
export class ChallengesApi extends runtime.BaseAPI {

    /**
     * @hidden
     * Get all undisbursed challenges
     */
    async getUndisbursedChallengesRaw(params: GetUndisbursedChallengesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UndisbursedChallenges>> {
        const queryParameters: any = {};

        if (params.offset !== undefined) {
            queryParameters['offset'] = params.offset;
        }

        if (params.limit !== undefined) {
            queryParameters['limit'] = params.limit;
        }

        if (params.userId !== undefined) {
            queryParameters['user_id'] = params.userId;
        }

        if (params.completedBlocknumber !== undefined) {
            queryParameters['completed_blocknumber'] = params.completedBlocknumber;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/challenges/undisbursed`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UndisbursedChallengesFromJSON(jsonValue));
    }

    /**
     * Get all undisbursed challenges
     */
    async getUndisbursedChallenges(params: GetUndisbursedChallengesRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UndisbursedChallenges> {
        const response = await this.getUndisbursedChallengesRaw(params, initOverrides);
        return await response.value();
    }

}
