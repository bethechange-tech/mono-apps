import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme';
import { homeStyles } from '../../home.styles';

export type HomeResultsMetaProps = {
  hasResults: boolean;
  newStoriesLabel: string;
  bookmarkCount: number;
  bookmarkLabel: string;
};

export const HomeResultsMeta: React.FC<HomeResultsMetaProps> = ({
  hasResults,
  newStoriesLabel,
  bookmarkCount,
  bookmarkLabel,
}) => {
  if (!hasResults) {
    return null;
  }

  return (
    <View style={homeStyles.resultsMetaRow}>
      <View style={homeStyles.resultsMetaPill}>
        <Ionicons name="sparkles-outline" size={14} color={palette.primary} />
        <Text style={homeStyles.resultsMetaText}>{newStoriesLabel}</Text>
      </View>
      {bookmarkCount > 0 && (
        <View style={[homeStyles.resultsMetaPill, homeStyles.resultsMetaPillAccent]}>
          <Ionicons name="bookmark-outline" size={14} color={palette.primary} />
          <Text style={homeStyles.resultsMetaText}>{bookmarkLabel}</Text>
        </View>
      )}
    </View>
  );
};

export default HomeResultsMeta;
