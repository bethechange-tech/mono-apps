import { create, type StateCreator } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

type HomeFiltersSlice = {
    category: string;
    setCategory: (category: string) => void;
};

type HomePricingSlice = {
    showTotal: boolean;
    setShowTotal: (value: boolean) => void;
    toggleShowTotal: () => void;
};

type HomeMapSlice = {
    showMap: boolean;
    setShowMap: (value: boolean) => void;
    toggleMap: () => void;
};

export type HomeStoreState = HomeFiltersSlice & HomePricingSlice & HomeMapSlice;

const createFiltersSlice: StateCreator<HomeStoreState, [], [], HomeFiltersSlice> = (set) => ({
    category: 'garage',
    setCategory: (category) => set({ category }),
});

const createPricingSlice: StateCreator<HomeStoreState, [], [], HomePricingSlice> = (set) => ({
    showTotal: true,
    setShowTotal: (value) => set({ showTotal: value }),
    toggleShowTotal: () => set((state) => ({ showTotal: !state.showTotal })),
});

const createMapSlice: StateCreator<HomeStoreState, [], [], HomeMapSlice> = (set) => ({
    showMap: false,
    setShowMap: (value) => set({ showMap: value }),
    toggleMap: () => set((state) => ({ showMap: !state.showMap })),
});

const useHomeStoreBase = create<HomeStoreState>()((set, get, store) => ({
    ...createFiltersSlice(set, get, store),
    ...createPricingSlice(set, get, store),
    ...createMapSlice(set, get, store),
}));

export const useHomeStore = useHomeStoreBase;

export const useHomeFilters = () =>
    useHomeStoreBase(
        useShallow(({ category, setCategory }) => ({ category, setCategory })),
    );

export const useHomePricing = () =>
    useHomeStoreBase(
        useShallow(({ showTotal, setShowTotal, toggleShowTotal }) => ({ showTotal, setShowTotal, toggleShowTotal })),
    );

export const useHomeMap = () =>
    useHomeStoreBase(
        useShallow(({ showMap, setShowMap, toggleMap }) => ({ showMap, setShowMap, toggleMap })),
    );
