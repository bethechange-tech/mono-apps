import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme';
import type { Story } from '@/modules/story';
import { homeStyles } from '../../home.styles';
import { HomeStoryCard } from './HomeStoryCard';

type HomeStoryListProps = {
  stories: Story[];
  showLikes: boolean;
  isStoryBookmarked: (storyId: string) => boolean;
  onPressStory: (story: Story) => void;
  onToggleBookmark: (story: Story) => void;
};

export const HomeStoryList: React.FC<HomeStoryListProps> = ({
  stories,
  showLikes,
  isStoryBookmarked,
  onPressStory,
  onToggleBookmark,
}) => {
  return (
    <View style={homeStyles.listContainer}>
      <View style={homeStyles.listHintRow}>
        <Ionicons name="information-circle-outline" size={14} color={palette.primary} />
        <Text style={homeStyles.listHintText}>
          Tap any story to read more or save it for later.
        </Text>
      </View>
      {stories.map((story) => (
        <HomeStoryCard
          key={story.id}
          story={story}
          showLikes={showLikes}
          isBookmarked={isStoryBookmarked(story.id)}
          onPress={onPressStory}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </View>
  );
};

export default HomeStoryList;
