import { create } from 'zustand';
import { STORIES, Story } from './data';
import { storyApiClient, StoryQueryParams, StorySortOrder, StoryFacetOptions } from './storyApi';

type NormalizedStoryParams = {
  search: string;
  category: Story['category'] | 'all';
  country: string;
  route: string;
  maxDaysAgo: number | null;
  sortOrder: StorySortOrder;
  limit: number | null;
};

const NORMALIZED_ALL = 'all' as const;

const normalizeStoryParams = (params?: StoryQueryParams): NormalizedStoryParams => {
  const search = params?.search?.trim().toLowerCase() ?? '';
  const category = (params?.category ?? NORMALIZED_ALL) as Story['category'] | 'all';
  const country = params?.country?.trim().toLowerCase() ?? '';
  const route = params?.route?.trim().toLowerCase() ?? '';
  const maxDaysAgo = typeof params?.maxDaysAgo === 'number' ? params.maxDaysAgo : null;
  const sortOrder = params?.sortOrder ?? 'newest';
  const limit = typeof params?.limit === 'number' ? params.limit : null;

  return { search, category, country, route, maxDaysAgo, sortOrder, limit };
};

const areStoryParamsEqual = (a?: StoryQueryParams, b?: StoryQueryParams): boolean => {
  const normalizedA = normalizeStoryParams(a);
  const normalizedB = normalizeStoryParams(b);

  return (
    normalizedA.search === normalizedB.search &&
    normalizedA.category === normalizedB.category &&
    normalizedA.country === normalizedB.country &&
    normalizedA.route === normalizedB.route &&
    normalizedA.maxDaysAgo === normalizedB.maxDaysAgo &&
    normalizedA.sortOrder === normalizedB.sortOrder &&
    normalizedA.limit === normalizedB.limit
  );
};

const isBaseQuery = (params?: StoryQueryParams): boolean => {
  const normalized = normalizeStoryParams(params);
  return (
    normalized.search.length === 0 &&
    normalized.category === NORMALIZED_ALL &&
    normalized.country.length === 0 &&
    normalized.route.length === 0 &&
    normalized.maxDaysAgo === null &&
    normalized.limit === null
  );
};

type StoryState = {
  stories: Story[];
  allStories: Story[];
  countryOptions: string[];
  routeOptions: string[];
  isLoading: boolean;
  hasLoaded: boolean;
  activeParams?: StoryQueryParams;
  lastRequestId: number;
  getStoryById: (id: string) => Story | undefined;
  loadStories: (params?: StoryQueryParams) => Promise<Story[]>;
};

export const useStoryStore = create<StoryState>((set, get) => ({
  ...(() => {
    const facets: StoryFacetOptions = storyApiClient.getFacetOptions(STORIES);
    return {
      stories: STORIES,
      allStories: STORIES,
      countryOptions: facets.countries,
      routeOptions: facets.routes,
    };
  })(),
  isLoading: false,
  hasLoaded: false,
  activeParams: undefined,
  lastRequestId: 0,
  getStoryById: (id) => {
    const { stories, allStories } = get();
    return stories.find((story) => story.id === id) ?? allStories.find((story) => story.id === id);
  },
  loadStories: async (params) => {
    const { hasLoaded, activeParams, isLoading } = get();
    if (isLoading && areStoryParamsEqual(activeParams, params)) {
      return get().stories;
    }

    if (hasLoaded && areStoryParamsEqual(activeParams, params)) {
      return get().stories;
    }

    const requestId = Date.now();
    set({ isLoading: true, lastRequestId: requestId, activeParams: params });

    try {
      const nextStories = await storyApiClient.fetchStories(params);
      const replaceAllStories = isBaseQuery(params);

      set((state) => {
        if (state.lastRequestId !== requestId) {
          return {};
        }

        const facets = replaceAllStories
          ? storyApiClient.getFacetOptions(nextStories)
          : { countries: state.countryOptions, routes: state.routeOptions };

        return {
          stories: nextStories,
          allStories: replaceAllStories ? nextStories : state.allStories,
          countryOptions: facets.countries,
          routeOptions: facets.routes,
          hasLoaded: true,
          activeParams: params,
          lastRequestId: requestId,
        };
      });

      return nextStories;
    } catch (error) {
      console.warn('Failed to load stories', error);
      throw error;
    } finally {
      if (get().lastRequestId === requestId) {
        set({ isLoading: false });
      }
    }
  },
}));

export default useStoryStore;
