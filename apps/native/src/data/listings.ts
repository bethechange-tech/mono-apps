import type { OpenApiJsonResponse } from 'stashspot-api-types';

export type ListStoragesResponse = OpenApiJsonResponse<'listStorages', 200>;
export type ListingSummary = ListStoragesResponse[number];
export type ListingCategory = NonNullable<ListingSummary['category']>;

export type GetStorageResponse = OpenApiJsonResponse<'getStorage', 200>;
export type ListingPost = GetStorageResponse['posts'][number];

export type Listing = GetStorageResponse;

