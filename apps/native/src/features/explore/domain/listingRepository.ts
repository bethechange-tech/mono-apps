import { isAxiosError } from 'axios';
import type { OpenApiJsonResponse } from 'stashspot-api-types';
import type { Listing, ListingSummary } from './types';
import { getApiClient } from '@/app/api/httpClient';

type ListStoragesResponse = OpenApiJsonResponse<'listStorages', 200>;
type StorageDetail = OpenApiJsonResponse<'getStorage', 200>;

const client = getApiClient();

export interface ListingRepository {
    list(): Promise<ListingSummary[]>;
    get(id: string): Promise<Listing | undefined>;
}

export const listingRepository: ListingRepository = {
    async list() {
        const { data } = await client.get<ListStoragesResponse>('/storages');
        return data;
    },
    async get(id: string) {
        try {
            const { data } = await client.get<StorageDetail>(`/storages/${id}`);
            return data as Listing;
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return undefined;
            }

            if (isAxiosError(error) && error.response) {
                throw new Error(`Failed to load storage ${id}: ${error.response.status}`);
            }

            throw error;
        }
    },
};
