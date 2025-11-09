import type { DateFilterOption, StoryCategory } from './home.types';

export const DATE_FILTERS: {
  key: DateFilterOption;
  label: string;
  maxDaysAgo: number | null;
}[] = [
  { key: 'any', label: 'Any time', maxDaysAgo: null },
  { key: '24h', label: 'Last 24h', maxDaysAgo: 1 },
  { key: '7d', label: 'Last 7 days', maxDaysAgo: 7 },
  { key: '30d', label: 'Last 30 days', maxDaysAgo: 30 },
  { key: '90d', label: 'Last 90 days', maxDaysAgo: 90 },
];

export const CATEGORIES: { key: StoryCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'law', label: 'Law' },
  { key: 'personal', label: 'Personal' },
];

export const FILTER_DEBOUNCE_MS = 200;
