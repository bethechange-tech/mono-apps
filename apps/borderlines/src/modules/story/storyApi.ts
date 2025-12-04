import axios, { type AxiosInstance } from 'axios';
import type { components } from 'borderlines-api-types';

import { Story, mapApiStory } from './data';

const collectUniqueValues = (items: (string | undefined)[]): string[] => {
  const unique = new Set<string>();
  items.forEach((value) => {
    if (value && value.trim().length > 0) {
      unique.add(value.trim());
    }
  });
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

const filterFacetValues = (values: string[], searchTerm: string, limit: number): string[] => {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  const base = normalizedTerm.length > 0
    ? values.filter((value) => value.toLowerCase().includes(normalizedTerm))
    : values;
  return base.slice(0, limit);
};

export type StorySortOrder = 'newest' | 'oldest';

export type StoryQueryParams = {
  search?: string;
  category?: Story['category'] | 'all';
  country?: string;
  route?: string;
  maxDaysAgo?: number;
  sortOrder?: StorySortOrder;
  limit?: number;
};

export type StoryApiConfig = {
  baseUrl?: string;
  timeoutMs?: number;
  seedStories?: Story[];
};

const NORMALIZED_ALL = 'all';

export type StoryFacetOptions = {
  countries: string[];
  routes: string[];
};

type StoryListResponse = components['schemas']['StoryListResponse'];
type ApiStory = components['schemas']['BorderlineStory'];
type CreateStoryRequest = components['schemas']['CreateStoryRequest'];
export type StoryImageUpload = components['schemas']['StoryImageUpload'];

export type CreateStoryPayload = {
  title: string;
  subtitle: string;
  category: Story['category'];
  summary: string;
  keyDetails: string;
  meaning: string;
  countryTag?: string | null;
  routeTag?: string | null;
  isSpotlight: boolean;
  likes?: number;
  images?: StoryImageUpload[];
};

const DEFAULT_TIMEOUT = 12_000;
const DEFAULT_BASE_URL =
  process.env.EXPO_PUBLIC_BORDERLINES_API_BASE_URL ??
  process.env.BORDERLINES_API_BASE_URL ??
  'https://borderline-api-527847102898.europe-west1.run.app';

const API_FILTERS_ENABLED =
  process.env.EXPO_PUBLIC_BORDERLINES_API_ENABLE_FILTERS === 'true' ||
  process.env.BORDERLINES_API_ENABLE_FILTERS === 'true';

export class StoryApiClient {
  private readonly client: AxiosInstance;
  private readonly seedStories: Story[];
  private cachedStories: Story[] | null = null;

  constructor(config: StoryApiConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeoutMs ?? DEFAULT_TIMEOUT,
    });
    this.seedStories = config.seedStories ?? [];
  }

  async fetchStories(
    params: StoryQueryParams = {},
    options: { refresh?: boolean } = {}
  ): Promise<Story[]> {
    const source = await this.getAllStories(params, options);
    return this.prepareStories(source, params);
  }

  async fetchStoryById(id: string, options: { refresh?: boolean } = {}): Promise<Story | undefined> {
    const source = await this.getAllStories({}, options);
    const cachedMatch = source.find((story) => story.id === id);
    if (cachedMatch) {
      return { ...cachedMatch };
    }

    try {
      const response = await this.client.get<ApiStory>(`/stories/${id}`);
      const mapped = mapApiStory(response.data);
      this.mergeStoryIntoCache(mapped);
      return mapped;
    } catch (error) {
      console.warn('Failed to fetch story by id', error);
      return undefined;
    }
  }

  async fetchSpotlight(options: { refresh?: boolean } = {}): Promise<Story | undefined> {
    const source = await this.getAllStories({}, options);
    const match = source.find((story) => story.isSpotlight);
    return match ? { ...match } : undefined;
  }

  async createStory(payload: CreateStoryPayload): Promise<Story> {
    const requestBody: CreateStoryRequest = {
      title: payload.title,
      subtitle: payload.subtitle,
      category: payload.category,
      summary: payload.summary,
      keyDetails: payload.keyDetails,
      meaning: payload.meaning,
      countryTag: payload.countryTag ?? null,
      routeTag: payload.routeTag ?? null,
      likes: payload.likes ?? 0,
      isSpotlight: payload.isSpotlight,
      images: payload.images ?? [],
    };

    const response = await this.client.post<ApiStory>('/stories', requestBody);
    const created = mapApiStory(response.data);
    this.mergeStoryIntoCache(created);
    return created;
  }

  getFacetOptions(sourceStories: Story[] = this.cachedStories ?? this.seedStories): StoryFacetOptions {
    const countries = collectUniqueValues(sourceStories.map((story) => story.countryTag));
    const routes = collectUniqueValues(sourceStories.map((story) => story.routeTag));
    return { countries, routes };
  }

  searchCountries(
    term: string,
    options: { limit?: number; sourceOptions?: string[] } = {}
  ): string[] {
    const limit = options.limit ?? 12;
    const source = options.sourceOptions ?? this.getFacetOptions().countries;
    return filterFacetValues(source, term, limit);
  }

  searchRoutes(
    term: string,
    options: { limit?: number; sourceOptions?: string[] } = {}
  ): string[] {
    const limit = options.limit ?? 12;
    const source = options.sourceOptions ?? this.getFacetOptions().routes;
    return filterFacetValues(source, term, limit);
  }

  private async getAllStories(
    params: StoryQueryParams = {},
    options: { refresh?: boolean } = {}
  ): Promise<Story[]> {
    const hasFilters = this.hasQueryFilters(params);

    if (!hasFilters && !options.refresh && this.cachedStories) {
      return this.cachedStories;
    }

    try {
      const response = await this.client.get<StoryListResponse>('/stories', {
        params: this.buildRequestQuery(params),
      });
      const mapped = (response.data?.data ?? []).map(mapApiStory);

      if (!hasFilters) {
        this.cachedStories = mapped;
      }

      return mapped;
    } catch (error) {
      console.warn('Failed to load stories from API, using seed data', error);

      if (!hasFilters) {
        this.cachedStories = this.seedStories;
      }

      return this.seedStories;
    }
  }

  private buildRequestQuery(params: StoryQueryParams): Record<string, string | number> {
    if (!API_FILTERS_ENABLED) {
      return {maxDaysAgo: 365};
    }

    const query: Record<string, string | number> = {};

    const normalizedSearch = params.search?.trim();
    if (normalizedSearch) {
      query.search = normalizedSearch;
    }

    if (params.category && params.category !== NORMALIZED_ALL) {
      query.category = params.category;
    }

    const normalizedCountry = params.country?.trim();
    if (normalizedCountry) {
      query.country = normalizedCountry;
    }

    const normalizedRoute = params.route?.trim();
    if (normalizedRoute) {
      query.route = normalizedRoute;
    }

    if (typeof params.maxDaysAgo === 'number') {
      query.maxDaysAgo = params.maxDaysAgo;
    }

    if (params.sortOrder && params.sortOrder !== 'newest') {
      query.sortOrder = params.sortOrder;
    }

    if (typeof params.limit === 'number') {
      query.limit = params.limit;
    }

    return query;
  }

  private hasQueryFilters(params: StoryQueryParams): boolean {
    if (!params) {
      return false;
    }

    const normalizedSearch = params.search?.trim();
    const normalizedCountry = params.country?.trim();
    const normalizedRoute = params.route?.trim();

    return (
      (normalizedSearch?.length ?? 0) > 0 ||
      (normalizedCountry?.length ?? 0) > 0 ||
      (normalizedRoute?.length ?? 0) > 0 ||
      (params.category && params.category !== NORMALIZED_ALL) ||
      typeof params.maxDaysAgo === 'number' ||
      (params.sortOrder && params.sortOrder !== 'newest') ||
      typeof params.limit === 'number'
    );
  }

  private prepareStories(source: Story[], params: StoryQueryParams): Story[] {
    const filtered = this.applyFilters(source, params);
    const sorted = this.applySorting(filtered, params.sortOrder);
    const limited = typeof params.limit === 'number' ? sorted.slice(0, params.limit) : sorted;
    return limited.map((story) => ({ ...story }));
  }

  private applyFilters(stories: Story[], params: StoryQueryParams): Story[] {
    const searchTerm = params.search?.trim().toLowerCase();
    const category = params.category ?? NORMALIZED_ALL;
    const country = params.country?.trim().toLowerCase();
    const route = params.route?.trim().toLowerCase();
    const maxDaysAgo = params.maxDaysAgo ?? 365;

    return stories.filter((story) => {
      const matchesCategory =
        category === NORMALIZED_ALL || story.category === category;

      const matchesCountry =
        !country || (story.countryTag && story.countryTag.toLowerCase().includes(country));

      const matchesRoute =
        !route || (story.routeTag && story.routeTag.toLowerCase().includes(route));

      const matchesDate =
        typeof maxDaysAgo !== 'number' || story.daysAgo <= maxDaysAgo;

      if (!matchesCategory || !matchesCountry || !matchesRoute || !matchesDate) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      const inTitle = story.title.toLowerCase().includes(searchTerm);
      const inSubtitle = story.subtitle.toLowerCase().includes(searchTerm);
      const inCountry = story.countryTag?.toLowerCase().includes(searchTerm);
      const inRoute = story.routeTag?.toLowerCase().includes(searchTerm);
      const inSummary = story.summary.toLowerCase().includes(searchTerm);

      return inTitle || inSubtitle || inCountry || inRoute || inSummary;
    });
  }

  private applySorting(stories: Story[], sortOrder: StorySortOrder = 'newest'): Story[] {
    const sorted = [...stories];

    sorted.sort((a, b) => {
      if (sortOrder === 'oldest') {
        return b.daysAgo - a.daysAgo;
      }
      return a.daysAgo - b.daysAgo;
    });

    return sorted;
  }

  private mergeStoryIntoCache(story: Story) {
    if (!this.cachedStories) {
      this.cachedStories = [story];
      return;
    }

    const index = this.cachedStories.findIndex((item) => item.id === story.id);
    if (index === -1) {
      this.cachedStories = [...this.cachedStories, story];
    } else {
      const next = [...this.cachedStories];
      next[index] = story;
      this.cachedStories = next;
    }
  }
}

export const storyApiClient = new StoryApiClient({
  baseUrl: DEFAULT_BASE_URL,
});
