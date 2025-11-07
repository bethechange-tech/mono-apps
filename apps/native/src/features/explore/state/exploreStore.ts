import { create } from 'zustand';
import type { Category } from '../domain/types';

export type TransportMode = 'car' | 'boat' | 'train' | 'bicycle' | 'airplane';
export type ExploreMode = 'list' | 'map';

interface ExploreState {
    query: string;
    origin: string;
    destination: string;
    showTotal: boolean;
    category: Category;
    transport: TransportMode;
    mode: ExploreMode;
    listingsLoading: boolean;
    setQuery(v: string): void;
    setOrigin(v: string): void;
    setDestination(v: string): void;
    toggleTotal(): void;
    setCategory(c: Category): void;
    setTransport(t: TransportMode): void;
    setMode(m: ExploreMode): void;
    setListingsLoading(l: boolean): void;
}

export const useExploreStore = create<ExploreState>((set) => ({
    query: '',
    origin: 'Your location',
    destination: 'Brooklyn, New York',
    showTotal: true,
    category: 'all',
    transport: 'car',
    mode: 'list',
    listingsLoading: false,
    setQuery: (v) => set({ query: v }),
    setOrigin: (v) => set({ origin: v }),
    setDestination: (v) => set({ destination: v }),
    toggleTotal: () => set((s) => ({ showTotal: !s.showTotal })),
    setCategory: (c) => set({ category: c }),
    setTransport: (t) => set({ transport: t }),
    setMode: (m) => set({ mode: m }),
    setListingsLoading: (l) => set({ listingsLoading: l }),
}));
