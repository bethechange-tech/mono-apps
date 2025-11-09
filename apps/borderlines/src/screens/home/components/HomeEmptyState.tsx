import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { homeStyles } from '../../home.styles';

type HomeEmptyStateProps = {
  onCreateStory: () => void;
};

export const HomeEmptyState: React.FC<HomeEmptyStateProps> = ({ onCreateStory }) => {
  return (
    <View style={homeStyles.emptyState}>
      <Text style={homeStyles.emptyTitle}>No stories match your filters</Text>
      <Text style={homeStyles.emptySubtitle}>
        Try a different search, or share a new immigration story with the community.
      </Text>
      <TouchableOpacity
        style={homeStyles.emptyAction}
        activeOpacity={0.8}
        onPress={onCreateStory}
      >
        <Text style={homeStyles.emptyActionLabel}>Create a story</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeEmptyState;
