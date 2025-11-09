export type CategoryKey = 'law' | 'personal';

export type FormState = {
  title: string;
  subtitle: string;
  email: string;
  category: CategoryKey;
  countryTag: string;
  routeTag: string;
  summary: string;
  keyDetails: string;
  meaning: string;
  imageUrls: string;
  shareAnonymously: boolean;
};

export type FieldKey = keyof FormState;
