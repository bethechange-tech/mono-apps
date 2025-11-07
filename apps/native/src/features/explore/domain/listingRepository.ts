import { listings } from '@/data/listings';
import type { Listing } from './types';

const mock: Listing[] = listings;

export interface ListingRepository {
    list(): Promise<Listing[]>;
    get(id: string): Promise<Listing | undefined>;
}

export const listingRepository: ListingRepository = {
    async list() {
        // Simulate latency
        await new Promise(r => setTimeout(r, 120));
        return mock;
    },
    async get(id: string) {
        await new Promise(r => setTimeout(r, 60));
        return mock.find(m => m.id === id);
    }
};
