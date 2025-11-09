import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { palette } from '@/theme';
import { homeStyles } from '../../home.styles';

export type HomeResultsHeaderProps = {
  resultsLabel: string;
  isFiltered: boolean;
  isLoading: boolean;
  onResetFilters: () => void;
};

export const HomeResultsHeader: React.FC<HomeResultsHeaderProps> = ({
  resultsLabel,
  isFiltered,
  isLoading,
  onResetFilters,
}) => {
  return (
    <View style={homeStyles.resultsRow}>
      <Text style={homeStyles.resultsCount}>{resultsLabel}</Text>
      {(isFiltered || isLoading) && (
        <View style={homeStyles.resultsControls}>
          {isLoading && <ActivityIndicator size="small" color={palette.primary} />}
          {isFiltered && (
            <TouchableOpacity
              onPress={onResetFilters}
              style={homeStyles.resetFiltersButton}
              activeOpacity={0.7}
            >
              <Text style={homeStyles.resetFiltersLabel}>Reset filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default HomeResultsHeader;
