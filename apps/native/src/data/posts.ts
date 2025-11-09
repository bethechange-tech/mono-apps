import type { OpenApiJsonResponse } from 'stashspot-api-types';

export type ListPostsResponse = OpenApiJsonResponse<'listPosts', 200>;
export type StoragePost = OpenApiJsonResponse<'getPost', 200>;
