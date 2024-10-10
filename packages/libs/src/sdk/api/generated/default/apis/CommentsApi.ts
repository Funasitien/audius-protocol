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
  CommentResponse,
  UnclaimedIdResponse,
} from '../models';
import {
    CommentResponseFromJSON,
    CommentResponseToJSON,
    UnclaimedIdResponseFromJSON,
    UnclaimedIdResponseToJSON,
} from '../models';

export interface GetCommentRepliesRequest {
    commentId: string;
    offset?: number;
    limit?: number;
}

/**
 * 
 */
export class CommentsApi extends runtime.BaseAPI {

    /**
     * @hidden
     * Gets replies to a parent comment
     */
    async getCommentRepliesRaw(params: GetCommentRepliesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CommentResponse>> {
        if (params.commentId === null || params.commentId === undefined) {
            throw new runtime.RequiredError('commentId','Required parameter params.commentId was null or undefined when calling getCommentReplies.');
        }

        const queryParameters: any = {};

        if (params.offset !== undefined) {
            queryParameters['offset'] = params.offset;
        }

        if (params.limit !== undefined) {
            queryParameters['limit'] = params.limit;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/comments/{comment_id}/replies`.replace(`{${"comment_id"}}`, encodeURIComponent(String(params.commentId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CommentResponseFromJSON(jsonValue));
    }

    /**
     * Gets replies to a parent comment
     */
    async getCommentReplies(params: GetCommentRepliesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CommentResponse> {
        const response = await this.getCommentRepliesRaw(params, initOverrides);
        return await response.value();
    }

    /**
     * @hidden
     * Gets an unclaimed blockchain comment ID
     */
    async getUnclaimedCommentIDRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UnclaimedIdResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/comments/unclaimed_id`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UnclaimedIdResponseFromJSON(jsonValue));
    }

    /**
     * Gets an unclaimed blockchain comment ID
     */
    async getUnclaimedCommentID(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UnclaimedIdResponse> {
        const response = await this.getUnclaimedCommentIDRaw(initOverrides);
        return await response.value();
    }

}
