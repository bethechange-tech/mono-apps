import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { featureFlags } from '@/config/featureFlags';
import { useBookmarkStore } from '@/modules/bookmark';
import { Story, StoryQueryParams, storyApiClient, useStoryStore } from '@/modules/story';
import { CATEGORIES, DATE_FILTERS, FILTER_DEBOUNCE_MS } from './home.constants';
import type { DateFilterOption, StoryCategory } from './home.types';

export type ActiveFilterChip = {
  key: string;
  label: string;
  onClear: () => void;
};

type UseDebouncedValueOptions = {
  delayMs?: number;
};

export const useDebouncedValue = <T>(value: T, options: UseDebouncedValueOptions = {}): T => {
  const { delayMs = FILTER_DEBOUNCE_MS } = options;
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debouncedValue;
};

type UseHomeScreenFilters = {
  selectedCategory: StoryCategory;
  setSelectedCategory: Dispatch<SetStateAction<StoryCategory>>;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  dateFilter: DateFilterOption;
  setDateFilter: Dispatch<SetStateAction<DateFilterOption>>;
  dateSortOrder: 'newest' | 'oldest';
  setDateSortOrder: Dispatch<SetStateAction<'newest' | 'oldest'>>;
  countryFilter: string;
  setCountryFilter: Dispatch<SetStateAction<string>>;
  routeFilter: string;
  setRouteFilter: Dispatch<SetStateAction<string>>;
  showCountryOptions: boolean;
  setShowCountryOptions: Dispatch<SetStateAction<boolean>>;
  showRouteOptions: boolean;
  setShowRouteOptions: Dispatch<SetStateAction<boolean>>;
  filteredCountryOptions: string[];
  filteredRouteOptions: string[];
  activeFilterChips: ActiveFilterChip[];
  handleResetFilters: () => void;
  toggleDateSortOrder: () => void;
  isFiltered: boolean;
};

type UseHomeScreenData = {
  stories: Story[];
  hasResults: boolean;
  spotlightStories: Story[];
  remainingStories: Story[];
  resultsLabel: string;
  newStoriesLabel: string;
  bookmarkLabel: string;
  bookmarkCount: number;
};

type UseHomeScreenState = {
  SHOW_LIKES: boolean;
  filters: UseHomeScreenFilters;
  data: UseHomeScreenData;
  meta: {
    hasLoadedStories: boolean;
    isLoadingStories: boolean;
  };
  actions: {
    handleToggleBookmark: (story: Story) => void;
    isStoryBookmarked: (storyId: string) => boolean;
  };
  ui: {
    showEncouragement: boolean;
    setShowEncouragement: Dispatch<SetStateAction<boolean>>;
  };
};

export const useHomeScreenState = (): UseHomeScreenState => {
  const SHOW_LIKES = featureFlags.showLikes;

  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('all');
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('any');
  const [dateSortOrder, setDateSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [countryFilter, setCountryFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [showCountryOptions, setShowCountryOptions] = useState(false);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(true);

  const stories = useStoryStore((state) => state.stories);
  const hasLoadedStories = useStoryStore((state) => state.hasLoaded);
  const isLoadingStories = useStoryStore((state) => state.isLoading);
  const loadStories = useStoryStore((state) => state.loadStories);
  const countryOptions = useStoryStore((state) => state.countryOptions);
  const routeOptions = useStoryStore((state) => state.routeOptions);

  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
  const isStoryBookmarked = useBookmarkStore((state) => state.isBookmarked);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  const debouncedQuery = useDebouncedValue(query);
  const debouncedCountryFilter = useDebouncedValue(countryFilter);
  const debouncedRouteFilter = useDebouncedValue(routeFilter);

  const queryParams = useMemo<StoryQueryParams>(() => {
    const params: StoryQueryParams = {
      sortOrder: dateSortOrder,
    };

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    const dateOption = DATE_FILTERS.find((option) => option.key === dateFilter);
    if (typeof dateOption?.maxDaysAgo === 'number') {
      params.maxDaysAgo = dateOption.maxDaysAgo;
    }

    const normalizedCountry = debouncedCountryFilter.trim();
    if (normalizedCountry.length > 0) {
      params.country = normalizedCountry;
    }

    const normalizedRoute = debouncedRouteFilter.trim();
    if (normalizedRoute.length > 0) {
      params.route = normalizedRoute;
    }

    const normalizedSearch = debouncedQuery.trim();
    if (normalizedSearch.length > 0) {
      params.search = normalizedSearch;
    }

    return params;
  }, [dateSortOrder, selectedCategory, dateFilter, debouncedCountryFilter, debouncedRouteFilter, debouncedQuery]);

  useEffect(() => {
    loadStories(queryParams).catch(() => {});
  }, [loadStories, queryParams]);

  const hasResults = stories.length > 0;
  const spotlightStories = stories.filter((story) => story.isSpotlight);
  const remainingStories = spotlightStories.length
    ? stories.filter((story) => !story.isSpotlight)
    : stories;

  const resultsLabel = `${stories.length} ${stories.length === 1 ? 'story' : 'stories'}`;

  const isFiltered =
    selectedCategory !== 'all' ||
    query.trim().length > 0 ||
    countryFilter.trim().length > 0 ||
    routeFilter.trim().length > 0 ||
    dateFilter !== 'any' ||
    dateSortOrder !== 'newest';

  const newStoriesCount = stories.filter((story) => story.daysAgo <= 2).length;
  const newStoriesLabel =
    newStoriesCount > 0
      ? `${newStoriesCount} ${newStoriesCount === 1 ? 'story' : 'stories'} added in last 48h`
      : 'No new stories in last 48h';

  const bookmarkCount = bookmarks.length;
  const bookmarkLabel =
    bookmarkCount === 0
      ? 'Nothing saved yet'
      : `${bookmarkCount} ${bookmarkCount === 1 ? 'story' : 'stories'} saved`;

  const handleToggleBookmark = useCallback(
    (story: Story) => {
      toggleBookmark({
        id: story.id,
        title: story.title,
        subtitle: story.subtitle,
        category: story.category,
        countryTag: story.countryTag,
        routeTag: story.routeTag,
        daysAgo: story.daysAgo,
        likes: story.likes,
      });
    },
    [toggleBookmark]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedCategory('all');
    setQuery('');
    setDateFilter('any');
    setDateSortOrder('newest');
    setCountryFilter('');
    setRouteFilter('');
    setShowCountryOptions(false);
    setShowRouteOptions(false);
  }, []);

  const toggleDateSortOrder = useCallback(() => {
    setDateSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
  }, []);

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    if (selectedCategory !== 'all') {
      const categoryLabel =
        CATEGORIES.find((category) => category.key === selectedCategory)?.label ?? 'Category';
      chips.push({
        key: 'category',
        label: categoryLabel,
        onClear: () => setSelectedCategory('all'),
      });
    }

    if (countryFilter.trim().length > 0) {
      const label = countryFilter.trim();
      chips.push({
        key: 'country',
        label,
        onClear: () => setCountryFilter(''),
      });
    }

    if (routeFilter.trim().length > 0) {
      const label = routeFilter.trim();
      chips.push({
        key: 'route',
        label,
        onClear: () => setRouteFilter(''),
      });
    }

    if (dateFilter !== 'any') {
      const dateLabel = DATE_FILTERS.find((option) => option.key === dateFilter)?.label ?? 'Date';
      chips.push({
        key: 'date',
        label: dateLabel,
        onClear: () => setDateFilter('any'),
      });
    }

    if (dateSortOrder !== 'newest') {
      chips.push({
        key: 'sort',
        label: 'Oldest first',
        onClear: () => setDateSortOrder('newest'),
      });
    }

    return chips;
  }, [selectedCategory, countryFilter, routeFilter, dateFilter, dateSortOrder]);

  const filteredCountryOptions = useMemo(() => {
    return storyApiClient.searchCountries(countryFilter, {
      limit: 12,
      sourceOptions: countryOptions,
    });
  }, [countryFilter, countryOptions]);

  const filteredRouteOptions = useMemo(() => {
    return storyApiClient.searchRoutes(routeFilter, {
      limit: 12,
      sourceOptions: routeOptions,
    });
  }, [routeFilter, routeOptions]);

  return {
    SHOW_LIKES,
    filters: {
      selectedCategory,
      setSelectedCategory,
      query,
      setQuery,
      dateFilter,
      setDateFilter,
      dateSortOrder,
      setDateSortOrder,
      countryFilter,
      setCountryFilter,
      routeFilter,
      setRouteFilter,
      showCountryOptions,
      setShowCountryOptions,
      showRouteOptions,
      setShowRouteOptions,
      filteredCountryOptions,
      filteredRouteOptions,
      activeFilterChips,
      handleResetFilters,
      toggleDateSortOrder,
      isFiltered,
    },
    data: {
      stories,
      hasResults,
      spotlightStories,
      remainingStories,
      resultsLabel,
      newStoriesLabel,
      bookmarkLabel,
      bookmarkCount,
    },
    meta: {
      hasLoadedStories,
      isLoadingStories,
    },
    actions: {
      handleToggleBookmark,
      isStoryBookmarked,
    },
    ui: {
      showEncouragement,
      setShowEncouragement,
    },
  };
};
