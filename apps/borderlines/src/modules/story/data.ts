import type { components } from 'borderlines-api-types';

export type StoryCategory = 'law' | 'personal';

export type Story = {
  id: string;
  title: string;
  subtitle: string;
  category: StoryCategory;
  daysAgo: number;
  likes: number;
  countryTag?: string;
  routeTag?: string;
  summary: string;
  keyDetails: string;
  meaning: string;
  images?: string[];
  isSpotlight?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiStory = components['schemas']['BorderlineStory'];

const normalizeTag = (value?: string | null) => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const mapApiStory = (input: ApiStory): Story => ({
  id: input.id,
  title: input.title,
  subtitle: input.subtitle,
  category: input.category,
  daysAgo: input.daysAgo,
  likes: input.likes,
  countryTag: normalizeTag(input.countryTag),
  routeTag: normalizeTag(input.routeTag),
  summary: input.summary,
  keyDetails: input.keyDetails,
  meaning: input.meaning,
  images: Array.isArray(input.images) ? input.images : [],
  isSpotlight: Boolean(input.isSpotlight),
  createdAt: input.createdAt,
  updatedAt: input.updatedAt,
});

