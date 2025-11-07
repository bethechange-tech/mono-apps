import { create } from 'zustand';

export type TransportMode = 'car' | 'boat' | 'train' | 'bicycle' | 'airplane';
export type ExploreMode = 'list' | 'map';

type ExploreState = {
    query: string;
    origin: string;
    destination: string;
    showTotal: boolean;
    category: string;
    transport: TransportMode;
    mode: ExploreMode;
    setQuery: (v: string) => void;
    setOrigin: (v: string) => void;
    setDestination: (v: string) => void;
    toggleTotal: () => void;
    setCategory: (c: string) => void;
    setTransport: (t: TransportMode) => void;
    setMode: (m: ExploreMode) => void;
};

export const useExploreStore = create<ExploreState>((set) => ({
    query: '',
    origin: 'Your location',
    destination: 'Brooklyn, New York',
    showTotal: true,
    category: 'all',
    transport: 'car',
    mode: 'list',
    setQuery: (v) => set({ query: v }),
    setOrigin: (v) => set({ origin: v }),
    setDestination: (v) => set({ destination: v }),
    toggleTotal: () => set((s) => ({ showTotal: !s.showTotal })),
    setCategory: (c) => set({ category: c }),
    setTransport: (t) => set({ transport: t }),
    setMode: (m) => set({ mode: m }),
}));
