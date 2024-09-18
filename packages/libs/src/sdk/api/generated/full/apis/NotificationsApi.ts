/* tslint:disable */
// @ts-nocheck
/* eslint-disable */
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


import * as runtime from '../runtime';
import type {
  NotificationsResponse,
  PlaylistUpdatesResponse,
} from '../models';
import {
    NotificationsResponseFromJSON,
    NotificationsResponseToJSON,
    PlaylistUpdatesResponseFromJSON,
    PlaylistUpdatesResponseToJSON,
} from '../models';

export interface GetNotificationsRequest {
    userId: string;
    timestamp?: number;
    groupId?: string;
    limit?: number;
    validTypes?: Array<GetNotificationsValidTypesEnum>;
}

export interface GetPlaylistUpdatesRequest {
    userId: string;
}

/**
 * 
 */
export class NotificationsApi extends runtime.BaseAPI {

    /**
     * @hidden
     * Get notifications for user ID
     */
    async getNotificationsRaw(params: GetNotificationsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<NotificationsResponse>> {
        if (params.userId === null || params.userId === undefined) {
            throw new runtime.RequiredError('userId','Required parameter params.userId was null or undefined when calling getNotifications.');
        }

        const queryParameters: any = {};

        if (params.timestamp !== undefined) {
            queryParameters['timestamp'] = params.timestamp;
        }

        if (params.groupId !== undefined) {
            queryParameters['group_id'] = params.groupId;
        }

        if (params.limit !== undefined) {
            queryParameters['limit'] = params.limit;
        }

        if (params.validTypes) {
            queryParameters['valid_types'] = params.validTypes;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/notifications/{user_id}`.replace(`{${"user_id"}}`, encodeURIComponent(String(params.userId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => NotificationsResponseFromJSON(jsonValue));
    }

    /**
     * Get notifications for user ID
     */
    async getNotifications(params: GetNotificationsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<NotificationsResponse> {
        const response = await this.getNotificationsRaw(params, initOverrides);
        return await response.value();
    }

    /**
     * @hidden
     * Get playlists the user has saved that have been updated for user ID
     */
    async getPlaylistUpdatesRaw(params: GetPlaylistUpdatesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<PlaylistUpdatesResponse>> {
        if (params.userId === null || params.userId === undefined) {
            throw new runtime.RequiredError('userId','Required parameter params.userId was null or undefined when calling getPlaylistUpdates.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/notifications/{user_id}/playlist_updates`.replace(`{${"user_id"}}`, encodeURIComponent(String(params.userId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PlaylistUpdatesResponseFromJSON(jsonValue));
    }

    /**
     * Get playlists the user has saved that have been updated for user ID
     */
    async getPlaylistUpdates(params: GetPlaylistUpdatesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<PlaylistUpdatesResponse> {
        const response = await this.getPlaylistUpdatesRaw(params, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const GetNotificationsValidTypesEnum = {
    Announcement: 'announcement',
    Follow: 'follow',
    Repost: 'repost',
    Save: 'save',
    Remix: 'remix',
    Cosign: 'cosign',
    Create: 'create',
    TipReceive: 'tip_receive',
    TipSend: 'tip_send',
    ChallengeReward: 'challenge_reward',
    RepostOfRepost: 'repost_of_repost',
    SaveOfRepost: 'save_of_repost',
    Tastemaker: 'tastemaker',
    Reaction: 'reaction',
    SupporterDethroned: 'supporter_dethroned',
    SupporterRankUp: 'supporter_rank_up',
    SupportingRankUp: 'supporting_rank_up',
    Milestone: 'milestone',
    TrackMilestone: 'track_milestone',
    TrackAddedToPlaylist: 'track_added_to_playlist',
    PlaylistMilestone: 'playlist_milestone',
    TierChange: 'tier_change',
    Trending: 'trending',
    TrendingPlaylist: 'trending_playlist',
    TrendingUnderground: 'trending_underground',
    UsdcPurchaseBuyer: 'usdc_purchase_buyer',
    UsdcPurchaseSeller: 'usdc_purchase_seller',
    TrackAddedToPurchasedAlbum: 'track_added_to_purchased_album',
    RequestManager: 'request_manager',
    ApproveManagerRequest: 'approve_manager_request',
    ClaimableReward: 'claimable_reward',
    Comment: 'comment'
} as const;
export type GetNotificationsValidTypesEnum = typeof GetNotificationsValidTypesEnum[keyof typeof GetNotificationsValidTypesEnum];
