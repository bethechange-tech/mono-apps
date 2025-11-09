import { create } from 'zustand';

import { listingRepository } from '@/features/explore/domain/listingRepository';
import type { Listing } from '@/data/listings';

type ListingStatus = 'idle' | 'loading' | 'loaded' | 'error';

type ListingEntry = {
    data?: Listing;
    status: ListingStatus;
    error?: string;
};

type ListingStore = {
    listings: Record<string, ListingEntry>;
    fetchListing: (id: string) => Promise<void>;
};

const idleEntry: ListingEntry = { status: 'idle' };

export const createListingSelector = (id: string) => (state: ListingStore) => state.listings[id] ?? idleEntry;

export const useListingStore = create<ListingStore>((set, get) => ({
    listings: {},
    fetchListing: async (id: string) => {
        const current = get().listings[id];
        if (current?.status === 'loading') {
            return;
        }

        set((state) => ({
            listings: {
                ...state.listings,
                [id]: {
                    ...(state.listings[id] ?? {}),
                    status: 'loading',
                    error: undefined,
                },
            },
        }));

        try {
            const data = await listingRepository.get(id);
            set((state) => ({
                listings: {
                    ...state.listings,
                    [id]: data
                        ? { data, status: 'loaded' }
                        : { status: 'error', error: 'Listing not found.' },
                },
            }));
        } catch (error) {
            set((state) => ({
                listings: {
                    ...state.listings,
                    [id]: {
                        status: 'error',
                        error: error instanceof Error ? error.message : 'Unable to load listing.',
                    },
                },
            }));
        }
    },
}));
