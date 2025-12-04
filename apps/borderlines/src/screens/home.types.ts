import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Story } from '@/modules/story';

export type StoryCategory = 'all' | Story['category'];

export type HomeStackParamList = {
  Home: undefined;
  ArticleDetail: { story?: Story; storyId?: string };
  CreateStory: undefined;
};

export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;
