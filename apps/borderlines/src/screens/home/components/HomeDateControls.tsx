import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme';
import { DATE_FILTERS } from '../../home.constants';
import { homeStyles } from '../../home.styles';
import type { DateFilterOption } from '../../home.types';

type HomeDateControlsProps = {
  dateFilter: DateFilterOption;
  selectDateFilter: (option: DateFilterOption) => void;
  dateSortOrder: 'newest' | 'oldest';
  toggleDateSortOrder: () => void;
};

export const HomeDateControls: React.FC<HomeDateControlsProps> = ({
  dateFilter,
  selectDateFilter,
  dateSortOrder,
  toggleDateSortOrder,
}) => {
  return (
    <View style={homeStyles.dateControlsRow}>
      <ScrollView
        style={homeStyles.dateFilterScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.dateFilterRow}
      >
        {DATE_FILTERS.map((option) => {
          const isActive = option.key === dateFilter;
          return (
            <TouchableOpacity
              key={option.key}
              style={[homeStyles.dateFilterChip, isActive && homeStyles.dateFilterChipActive]}
              onPress={() => selectDateFilter(option.key)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Filter stories: ${option.label}`}
            >
              <Text
                style={[homeStyles.dateFilterLabel, isActive && homeStyles.dateFilterLabelActive]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        style={homeStyles.dateSortButton}
        onPress={toggleDateSortOrder}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${dateSortOrder === 'newest' ? 'oldest first' : 'newest first'}`}
      >
        <Ionicons
          name={dateSortOrder === 'newest' ? 'arrow-down' : 'arrow-up'}
          size={14}
          color={palette.primary}
        />
        <Text style={homeStyles.dateSortLabel}>
          {dateSortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeDateControls;
