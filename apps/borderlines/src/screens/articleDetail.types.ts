import type { Story } from '@/modules/story';

export type ArticleDetailRouteParams = {
  ArticleDetail: {
    story?: Story;
    storyId?: string;
  };
};
