import React, { memo } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme';
import { CATEGORIES } from '../../home.constants';
import { homeStyles } from '../../home.styles';
import type { ActiveFilterChip } from '../../home.hooks';
import type { StoryCategory } from '../../home.types';

type HomeHeaderProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  countryFilter: string;
  onChangeCountryFilter: (value: string) => void;
  onClearCountryFilter: () => void;
  showCountryOptions: boolean;
  filteredCountryOptions: string[];
  onSelectCountryOption: (option: string) => void;
  onFocusCountryInput: () => void;
  routeFilter: string;
  onChangeRouteFilter: (value: string) => void;
  onClearRouteFilter: () => void;
  showRouteOptions: boolean;
  filteredRouteOptions: string[];
  onSelectRouteOption: (option: string) => void;
  onFocusRouteInput: () => void;
  activeFilterChips: ActiveFilterChip[];
  onResetFilters: () => void;
  selectedCategory: StoryCategory;
  onSelectCategory: (category: StoryCategory) => void;
  showEncouragement: boolean;
  onDismissEncouragement: () => void;
  onCreateStory: () => void;
  resultsLabel: string;
  isFiltered: boolean;
  isLoading: boolean;
};

const HomeHeaderComponent = ({
  query,
  onChangeQuery,
  countryFilter,
  onChangeCountryFilter,
  onClearCountryFilter,
  showCountryOptions,
  filteredCountryOptions,
  onSelectCountryOption,
  onFocusCountryInput,
  routeFilter,
  onChangeRouteFilter,
  onClearRouteFilter,
  showRouteOptions,
  filteredRouteOptions,
  onSelectRouteOption,
  onFocusRouteInput,
  activeFilterChips,
  onResetFilters,
  selectedCategory,
  onSelectCategory,
  showEncouragement,
  onDismissEncouragement,
  onCreateStory,
  resultsLabel,
  isFiltered,
  isLoading,
}: HomeHeaderProps) => {
  return (
    <View style={homeStyles.headerCard}>
      <View style={homeStyles.headerRow}>
        <View style={homeStyles.greetingGroup}>
          <Text style={homeStyles.greeting}>Discover</Text>
          <Text style={homeStyles.greetingSubhead}>{resultsLabel}</Text>
        </View>
        <TouchableOpacity
          style={homeStyles.createButton}
          activeOpacity={0.8}
          onPress={onCreateStory}
          accessibilityRole="button"
          accessibilityLabel="Share your immigration story"
        >
          <Ionicons
            name="create-outline"
            size={16}
            color="#FFFFFF"
            style={homeStyles.createButtonIcon}
          />
          <Text style={homeStyles.createButtonLabel}>Share</Text>
        </TouchableOpacity>
      </View>

      {showEncouragement && (
        <View style={homeStyles.encouragementCard}>
          <TouchableOpacity
            accessibilityLabel="Dismiss encouragement message"
            accessibilityRole="button"
            onPress={onDismissEncouragement}
            style={homeStyles.encouragementClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color={palette.textSubtle} />
          </TouchableOpacity>
          <Text style={homeStyles.encouragementTitle}>Your journey is worth hearing</Text>
          <Text style={homeStyles.encouragementCopy}>
            Every policy update and lived experience helps someone else feel less alone. Share what you learned so others can find their way forward.
          </Text>
          <Text style={homeStyles.encouragementFootnote}>
            Don't worry about perfection - we review every submission with care before it goes live.
          </Text>
        </View>
      )}

      <View style={homeStyles.searchContainer}>
        <View style={homeStyles.searchInputWrapper}>
          <Ionicons
            name="search"
            size={16}
            color={palette.textSubtle}
            style={homeStyles.searchIcon}
          />
          <TextInput
            placeholder="Search stories, routes, countries..."
            placeholderTextColor={palette.textSubtle}
            value={query}
            onChangeText={onChangeQuery}
            style={homeStyles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search stories and immigration routes"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeQuery('')}
              style={homeStyles.searchClearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color={palette.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={homeStyles.searchMetaRow}>
          <View style={homeStyles.searchMetaItem}>
            <Ionicons name="time-outline" size={14} color={palette.primary} />
            <Text style={homeStyles.searchMetaText}>
              {isLoading ? 'Refreshing stories...' : resultsLabel}
            </Text>
          </View>
          {isFiltered && (
            <TouchableOpacity
              onPress={onResetFilters}
              style={homeStyles.searchResetButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Reset all filters"
            >
              <Ionicons name="refresh" size={14} color={palette.primary} />
              <Text style={homeStyles.searchResetText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={homeStyles.filterInputsRow}>
        <View style={homeStyles.filterInputWrapper}>
          <Ionicons
            name="flag-outline"
            size={14}
            color={palette.textMuted}
            style={homeStyles.filterInputIcon}
          />
          <TextInput
            value={countryFilter}
            onChangeText={onChangeCountryFilter}
            onFocus={onFocusCountryInput}
            placeholder="Filter by country"
            placeholderTextColor={palette.textMuted}
            style={homeStyles.filterInput}
          />
          {countryFilter.length > 0 && (
            <TouchableOpacity
              onPress={onClearCountryFilter}
              style={homeStyles.filterClearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear country filter"
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          )}
          {showCountryOptions && (
            <View style={homeStyles.filterTypeaheadContainer}>
              {filteredCountryOptions.length === 0 ? (
                <Text style={homeStyles.filterTypeaheadEmpty}>No matches found</Text>
              ) : (
                filteredCountryOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      homeStyles.filterTypeaheadItem,
                      index === filteredCountryOptions.length - 1 &&
                        homeStyles.filterTypeaheadItemLast,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => onSelectCountryOption(option)}
                  >
                    <Text style={homeStyles.filterTypeaheadText}>{option}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        <View style={homeStyles.filterInputWrapper}>
          <Ionicons
            name="briefcase-outline"
            size={14}
            color={palette.textMuted}
            style={homeStyles.filterInputIcon}
          />
          <TextInput
            value={routeFilter}
            onChangeText={onChangeRouteFilter}
            onFocus={onFocusRouteInput}
            placeholder="Filter by route"
            placeholderTextColor={palette.textMuted}
            style={homeStyles.filterInput}
          />
          {routeFilter.length > 0 && (
            <TouchableOpacity
              onPress={onClearRouteFilter}
              style={homeStyles.filterClearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear route filter"
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          )}
          {showRouteOptions && (
            <View style={homeStyles.filterTypeaheadContainer}>
              {filteredRouteOptions.length === 0 ? (
                <Text style={homeStyles.filterTypeaheadEmpty}>No matches found</Text>
              ) : (
                filteredRouteOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      homeStyles.filterTypeaheadItem,
                      index === filteredRouteOptions.length - 1 &&
                        homeStyles.filterTypeaheadItemLast,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => onSelectRouteOption(option)}
                  >
                    <Text style={homeStyles.filterTypeaheadText}>{option}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </View>

      {activeFilterChips.length > 0 && (
        <View style={homeStyles.activeFiltersSection}>
          <View style={homeStyles.activeFiltersHeader}>
            <View style={homeStyles.activeFiltersTitleRow}>
              <Ionicons name="filter-outline" size={14} color={palette.primary} />
              <Text style={homeStyles.activeFiltersTitle}>Active filters</Text>
            </View>
            <TouchableOpacity
              onPress={onResetFilters}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
            >
              <Text style={homeStyles.activeFiltersClear}>Clear all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={homeStyles.activeFiltersScroll}
            contentContainerStyle={homeStyles.activeFiltersRow}
          >
            {activeFilterChips.map((chip) => (
              <TouchableOpacity
                key={chip.key}
                style={homeStyles.activeFilterChip}
                onPress={chip.onClear}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Remove filter ${chip.label}`}
              >
                <Text style={homeStyles.activeFilterChipLabel}>{chip.label}</Text>
                <Ionicons
                  name="close"
                  size={12}
                  color={palette.textMuted}
                  style={homeStyles.activeFilterChipIcon}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={homeStyles.chipsScroll}
        contentContainerStyle={homeStyles.chipsRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.key;
          return (
            <View
              key={category.key}
              style={[homeStyles.chip, isActive && homeStyles.chipActive]}
            >
              <Text
                style={[homeStyles.chipLabel, isActive && homeStyles.chipLabelActive]}
                onPress={() => onSelectCategory(category.key as StoryCategory)}
              >
                {category.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const HomeHeader = memo(HomeHeaderComponent);
