import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Story } from '@/modules/story';

export type StoryCategory = 'all' | 'law' | 'personal';

export type HomeStackParamList = {
  Home: undefined;
  ArticleDetail: { story?: Story; storyId?: string };
  CreateStory: undefined;
};

export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export type DateFilterOption = 'any' | '24h' | '7d' | '30d' | '90d';
