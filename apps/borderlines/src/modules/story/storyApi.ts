import { STORIES, Story } from './data';

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
  latencyMs?: number;
};

const NORMALIZED_ALL = 'all';

export type StoryFacetOptions = {
  countries: string[];
  routes: string[];
};

export class StoryApiClient {
  private readonly latencyMs: number;

  constructor(config: StoryApiConfig = {}) {
    this.latencyMs = config.latencyMs ?? 120;
  }

  async fetchStories(params: StoryQueryParams = {}): Promise<Story[]> {
    await this.simulateLatency();
    const filtered = this.applyFilters(STORIES, params);
    const sorted = this.applySorting(filtered, params.sortOrder);
    const limited = typeof params.limit === 'number' ? sorted.slice(0, params.limit) : sorted;
    return limited.map((story) => ({ ...story }));
  }

  async fetchStoryById(id: string): Promise<Story | undefined> {
    await this.simulateLatency();
    const match = STORIES.find((story) => story.id === id);
    return match ? { ...match } : undefined;
  }

  async fetchSpotlight(): Promise<Story | undefined> {
    await this.simulateLatency();
    const match = STORIES.find((story) => story.isSpotlight);
    return match ? { ...match } : undefined;
  }

  getFacetOptions(sourceStories: Story[] = STORIES): StoryFacetOptions {
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

  private applyFilters(stories: Story[], params: StoryQueryParams): Story[] {
    const searchTerm = params.search?.trim().toLowerCase();
    const category = params.category ?? NORMALIZED_ALL;
    const country = params.country?.trim().toLowerCase();
    const route = params.route?.trim().toLowerCase();
    const maxDaysAgo = params.maxDaysAgo;

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

  private async simulateLatency() {
    if (this.latencyMs <= 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }
}

export const storyApiClient = new StoryApiClient();
