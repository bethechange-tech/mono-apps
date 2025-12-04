import { useCallback, useEffect, useMemo, useState } from 'react';
import { StoryQueryParams, useStoryStore } from '@/modules/story';
import type { Story } from '@/modules/story';
import type { StoryCategory } from './home.types';

const DEFAULT_CATEGORY_ORDER: StoryCategory[] = ['all', 'law', 'personal'];

type DiscoverScreenState = {
  stories: Story[];
  search: string;
  setSearch: (value: string) => void;
  selectedCategory: StoryCategory;
  setSelectedCategory: (value: StoryCategory) => void;
  categories: StoryCategory[];
  selectedCountry?: string;
  setSelectedCountry: (value: string | undefined) => void;
  selectedRoute?: string;
  setSelectedRoute: (value: string | undefined) => void;
  maxDaysAgo?: number;
  setMaxDaysAgo: (value: number | undefined) => void;
  sortOrder: StoryQueryParams['sortOrder'];
  setSortOrder: (value: StoryQueryParams['sortOrder']) => void;
  countryOptions: string[];
  routeOptions: string[];
  isLoading: boolean;
  hasLoaded: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
};

export const useDiscoverScreenState = (): DiscoverScreenState => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>();
  const [maxDaysAgo, setMaxDaysAgo] = useState<number | undefined>();
  const [sortOrder, setSortOrder] = useState<StoryQueryParams['sortOrder']>('newest');

  const stories = useStoryStore((state) => state.stories);
  const loadStories = useStoryStore((state) => state.loadStories);
  const isLoading = useStoryStore((state) => state.isLoading);
  const hasLoaded = useStoryStore((state) => state.hasLoaded);
  const countryOptions = useStoryStore((state) => state.countryOptions);
  const routeOptions = useStoryStore((state) => state.routeOptions);

  const queryParams = useMemo<StoryQueryParams>(() => {
    const params: StoryQueryParams = {
      sortOrder: 'newest',
    };

    const normalizedSearch = search.trim();
    if (normalizedSearch.length > 0) {
      params.search = normalizedSearch;
    }

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    if (selectedCountry) {
      params.country = selectedCountry;
    }

    if (selectedRoute) {
      params.route = selectedRoute;
    }

    if (typeof maxDaysAgo === 'number') {
      params.maxDaysAgo = maxDaysAgo;
    }

    if (sortOrder !== 'newest') {
      params.sortOrder = sortOrder;
    }

    return params;
  }, [maxDaysAgo, search, selectedCategory, selectedCountry, selectedRoute, sortOrder]);

  useEffect(() => {
    loadStories(queryParams).catch(() => {});
  }, [loadStories, queryParams]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadStories(queryParams, { refresh: true });
    } finally {
      setIsRefreshing(false);
    }
  }, [loadStories, queryParams]);

  const categories = useMemo(() => {
    const ordered = new Set<StoryCategory>(DEFAULT_CATEGORY_ORDER);
    stories.forEach((story) => {
      ordered.add(story.category as StoryCategory);
    });
    return Array.from(ordered);
  }, [stories]);

  return {
    stories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    categories,
    selectedCountry,
    setSelectedCountry,
    selectedRoute,
    setSelectedRoute,
    maxDaysAgo,
    setMaxDaysAgo,
    sortOrder,
    setSortOrder,
    countryOptions,
    routeOptions,
    isLoading,
    hasLoaded,
    isRefreshing,
    refresh,
  };
};
