import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import type { Story, StorySortOrder } from '@/modules/story';
import { palette } from '@/theme';
import { homeStyles } from './home.styles';
import { useDiscoverScreenState } from './home.hooks';
import type { HomeNavigationProp, StoryCategory } from './home.types';

const STORY_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1522199996450-65bd33f3aa2c?auto=format&fit=crop&w=900&q=80';

const formatCategoryLabel = (category: StoryCategory | Story['category']): string => {
  if (category === 'all') {
    return 'All';
  }
  if (category === 'law') {
    return 'Law';
  }
  if (category === 'personal') {
    return 'Personal';
  }
  const label = typeof category === 'string' ? category : '';
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const formatStoryTime = (value?: number): string => {
  if (!Number.isFinite(value)) {
    return 'Just now';
  }
  const days = Math.max(0, Math.floor(value as number));
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return '1 day ago';
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks === 1) {
    return '1 week ago';
  }
  if (weeks < 5) {
    return `${weeks} weeks ago`;
  }
  const months = Math.floor(days / 30);
  if (months <= 1) {
    return '1 month ago';
  }
  return `${months} months ago`;
};

const getStoryImage = (story: Story): string => {
  if (Array.isArray(story.images) && story.images.length > 0) {
    return story.images[0];
  }
  return STORY_PLACEHOLDER_IMAGE;
};

type DiscoverStoryCardProps = {
  story: Story;
  onPress: (story: Story) => void;
};

const DiscoverStoryCard = ({ story, onPress }: DiscoverStoryCardProps) => {
  return (
    <TouchableOpacity
      style={homeStyles.storyCard}
      activeOpacity={0.85}
      onPress={() => onPress(story)}
      accessibilityRole="button"
      accessibilityLabel={`Read story ${story.title}`}
    >
      <Image
        source={{ uri: getStoryImage(story) }}
        style={homeStyles.storyImage}
        resizeMode="cover"
      />
      <View style={homeStyles.storyBody}>
        <View style={homeStyles.storyCategoryRow}>
          <View style={homeStyles.storyCategoryBadge}>
            <Text style={homeStyles.storyCategoryLabel}>
              {formatCategoryLabel(story.category)}
            </Text>
          </View>
          <Text style={homeStyles.storyTimestamp}>{formatStoryTime(story.daysAgo)}</Text>
        </View>
        <Text style={homeStyles.storyTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={homeStyles.storySummary} numberOfLines={2}>
          {story.summary}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

type FilterFieldKey = 'category' | 'country' | 'route' | 'recency' | 'sort';

type DraftFilters = {
  category: StoryCategory;
  country?: string;
  route?: string;
  recency?: number;
  sortOrder: StorySortOrder;
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const {
    stories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    categories,
    selectedCountry,
    setSelectedCountry,
    selectedRoute,
    setSelectedRoute,
    maxDaysAgo,
    setMaxDaysAgo,
    sortOrder,
    setSortOrder,
    countryOptions,
    routeOptions,
    isLoading,
    hasLoaded,
    isRefreshing,
    refresh,
  } = useDiscoverScreenState();
  const [isFilterSheetVisible, setFilterSheetVisible] = useState(false);
  const [activePicker, setActivePicker] = useState<FilterFieldKey | null>(null);
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(() => ({
    category: selectedCategory,
    country: selectedCountry,
    route: selectedRoute,
    recency: maxDaysAgo,
    sortOrder: sortOrder ?? 'newest',
  }));
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [routeSearchTerm, setRouteSearchTerm] = useState('');

  const recencyOptions = useMemo(
    () => [
      { label: 'Any time', value: undefined },
      { label: 'Past 7 days', value: 7 },
      { label: 'Past 14 days', value: 14 },
      { label: 'Past 30 days', value: 30 },
      { label: 'Past 90 days', value: 90 },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { label: 'Newest first', value: 'newest' as StorySortOrder },
      { label: 'Oldest first', value: 'oldest' as StorySortOrder },
    ],
    []
  );

  const togglePicker = useCallback(
    (field: FilterFieldKey) => {
      setActivePicker((current) => {
        const next = current === field ? null : field;
        if (next !== 'country') {
          setCountrySearchTerm('');
        }
        if (next !== 'route') {
          setRouteSearchTerm('');
        }
        return next;
      });
    },
    []
  );

  const handleDraftCategoryChange = useCallback((category: StoryCategory) => {
    setDraftFilters((prev) => ({ ...prev, category }));
    setActivePicker(null);
  }, []);

  const handleDraftCountryChange = useCallback((country?: string) => {
    setDraftFilters((prev) => ({ ...prev, country }));
    setActivePicker(null);
    setCountrySearchTerm('');
  }, []);

  const handleDraftRouteChange = useCallback((route?: string) => {
    setDraftFilters((prev) => ({ ...prev, route }));
    setActivePicker(null);
    setRouteSearchTerm('');
  }, []);

  const handleDraftRecencyChange = useCallback((recency?: number) => {
    setDraftFilters((prev) => ({ ...prev, recency }));
    setActivePicker(null);
  }, []);

  const handleDraftSortChange = useCallback((value: StorySortOrder) => {
    setDraftFilters((prev) => ({ ...prev, sortOrder: value }));
    setActivePicker(null);
  }, []);

  const handleOpenFilters = useCallback(() => {
    setDraftFilters({
      category: selectedCategory,
      country: selectedCountry,
      route: selectedRoute,
      recency: maxDaysAgo,
      sortOrder: sortOrder ?? 'newest',
    });
    setActivePicker(null);
    setCountrySearchTerm('');
    setRouteSearchTerm('');
    setFilterSheetVisible(true);
  }, [maxDaysAgo, selectedCategory, selectedCountry, selectedRoute, sortOrder]);

  const handleCloseFilters = useCallback(() => {
    setFilterSheetVisible(false);
    setActivePicker(null);
    setDraftFilters({
      category: selectedCategory,
      country: selectedCountry,
      route: selectedRoute,
      recency: maxDaysAgo,
      sortOrder: sortOrder ?? 'newest',
    });
    setCountrySearchTerm('');
    setRouteSearchTerm('');
  }, [maxDaysAgo, selectedCategory, selectedCountry, selectedRoute, sortOrder]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters({
      category: 'all',
      country: undefined,
      route: undefined,
      recency: undefined,
      sortOrder: 'newest',
    });
    setActivePicker(null);
    setCountrySearchTerm('');
    setRouteSearchTerm('');
  }, []);

  const handleApplyFilters = useCallback(() => {
    setSelectedCategory(draftFilters.category);
    setSelectedCountry(draftFilters.country);
    setSelectedRoute(draftFilters.route);
    setMaxDaysAgo(draftFilters.recency);
    setSortOrder(draftFilters.sortOrder);
    setFilterSheetVisible(false);
    setActivePicker(null);
    setCountrySearchTerm('');
    setRouteSearchTerm('');
  }, [draftFilters, setMaxDaysAgo, setSelectedCategory, setSelectedCountry, setSelectedRoute, setSortOrder]);

  const activeRecencyLabel = useMemo(() => {
    const match = recencyOptions.find((option) => option.value === draftFilters.recency);
    return match?.label ?? 'Any time';
  }, [draftFilters.recency, recencyOptions]);

  const activeSortLabel = useMemo(() => {
    const match = sortOptions.find((option) => option.value === draftFilters.sortOrder);
    return match?.label ?? 'Newest first';
  }, [draftFilters.sortOrder, sortOptions]);

  const activeCategoryLabel = useMemo(
    () => formatCategoryLabel(draftFilters.category),
    [draftFilters.category]
  );

  const activeCountryLabel = useMemo(
    () => draftFilters.country ?? 'All countries',
    [draftFilters.country]
  );

  const activeRouteLabel = useMemo(
    () => draftFilters.route ?? 'All routes',
    [draftFilters.route]
  );

  const filteredCountryOptions = useMemo(() => {
    const term = countrySearchTerm.trim().toLowerCase();
    if (!term) {
      return countryOptions;
    }
    return countryOptions.filter((option) => option.toLowerCase().includes(term));
  }, [countryOptions, countrySearchTerm]);

  const filteredRouteOptions = useMemo(() => {
    const term = routeSearchTerm.trim().toLowerCase();
    if (!term) {
      return routeOptions;
    }
    return routeOptions.filter((option) => option.toLowerCase().includes(term));
  }, [routeOptions, routeSearchTerm]);

  const handlePressStory = useCallback(
    (story: Story) => {
      navigation.navigate('ArticleDetail', { story, storyId: story.id });
    },
    [navigation]
  );

  const handleCreateStory = useCallback(() => {
    navigation.navigate('CreateStory');
  }, [navigation]);

  const handleSelectCategory = useCallback(
    (category: StoryCategory) => {
      setSelectedCategory(category);
    },
    [setSelectedCategory]
  );

  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, [setSearch]);

  const listData = useMemo(() => stories, [stories]);

  const renderStoryItem = useCallback(
    ({ item }: { item: Story }) => (
      <DiscoverStoryCard story={item} onPress={handlePressStory} />
    ),
    [handlePressStory]
  );

  const headerComponent = useMemo(() => (
    <View style={homeStyles.headerContainer}>
      <View style={homeStyles.headerTopRow}>
        <View style={homeStyles.headerTitleGroup}>
          <Text style={homeStyles.headerTitle}>Discover</Text>
          <Text style={homeStyles.headerSubtitle}>
            News and lived journeys curated for you
          </Text>
        </View>
        <View style={homeStyles.headerActions}>
          <TouchableOpacity
            style={homeStyles.iconButton}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="View updates"
          >
            <Ionicons name="notifications-outline" size={20} color={palette.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.iconButton}
            activeOpacity={0.8}
            onPress={handleCreateStory}
            accessibilityRole="button"
            accessibilityLabel="Share your journey"
          >
            <Ionicons name="create-outline" size={20} color={palette.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={homeStyles.searchWrapper}>
        <Ionicons name="search" size={18} color={palette.textMuted} style={homeStyles.searchIcon} />
        <TextInput
          style={homeStyles.searchInput}
          placeholder="Search news around the world"
          placeholderTextColor={palette.textSubtle}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        <View style={homeStyles.searchTrailingGroup}>
          {search.length > 0 && (
            <TouchableOpacity
              style={homeStyles.searchClearButton}
              activeOpacity={0.7}
              onPress={handleClearSearch}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color={palette.textSubtle} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={homeStyles.searchFilterButton}
            activeOpacity={0.7}
            onPress={handleOpenFilters}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
          >
            <Ionicons name="options-outline" size={20} color={palette.text} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={homeStyles.chipsScroll}
        contentContainerStyle={homeStyles.chipsContent}
      >
        {categories.map((category) => {
          const isActive = category === selectedCategory;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => handleSelectCategory(category)}
              style={[homeStyles.chip, isActive && homeStyles.chipActive]}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${formatCategoryLabel(category)}`}
            >
              <Text style={[homeStyles.chipLabel, isActive && homeStyles.chipLabelActive]}>
                {formatCategoryLabel(category)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={homeStyles.sectionHeader}>
        <Text style={homeStyles.sectionTitle}>Top stories</Text>
      </View>
    </View>
  ), [
    categories,
    handleClearSearch,
    handleCreateStory,
    handleSelectCategory,
    handleOpenFilters,
    search,
    selectedCategory,
    setSearch,
  ]);

  const emptyComponent = useMemo(() => {
    if (isLoading && hasLoaded) {
      return (
        <View style={homeStyles.emptyState}>
          <ActivityIndicator size="small" color={palette.primary} />
          <Text style={homeStyles.emptySubtitle}>Refreshing stories...</Text>
        </View>
      );
    }

    return (
      <View style={homeStyles.emptyState}>
        <Text style={homeStyles.emptyTitle}>No stories found</Text>
        <Text style={homeStyles.emptySubtitle}>
          Try a different search or explore another route.
        </Text>
      </View>
    );
  }, [hasLoaded, isLoading]);

  if (!hasLoaded && isLoading) {
    return (
      <SafeAreaView style={homeStyles.safeArea}>
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={homeStyles.loadingLabel}>Loading stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <View style={homeStyles.container}>
        <FlatList<Story>
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderStoryItem}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={emptyComponent}
          contentContainerStyle={homeStyles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={(
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                refresh().catch(() => {});
              }}
              tintColor={palette.primary}
            />
          )}
        />
      </View>
      <Modal
        visible={isFilterSheetVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseFilters}
      >
        <View style={homeStyles.filterOverlay}>
          <TouchableOpacity
            style={homeStyles.filterBackdrop}
            activeOpacity={1}
            onPress={handleCloseFilters}
            accessibilityRole="button"
            accessibilityLabel="Close filters"
          />
          <View style={homeStyles.filterSheet}>
            <View style={homeStyles.filterHeader}>
              <Text style={homeStyles.filterHeaderTitle}>Filters</Text>
              <TouchableOpacity
                style={homeStyles.filterCloseButton}
                onPress={handleCloseFilters}
                accessibilityRole="button"
                accessibilityLabel="Close filters"
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={homeStyles.filterBody}>
              <ScrollView
                contentContainerStyle={homeStyles.filterContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={homeStyles.filterResetRow}>
                  <TouchableOpacity
                    style={homeStyles.filterResetButton}
                    onPress={handleResetFilters}
                    accessibilityRole="button"
                    accessibilityLabel="Reset filters"
                    activeOpacity={0.7}
                  >
                    <Text style={homeStyles.filterResetText}>Reset all</Text>
                  </TouchableOpacity>
                </View>
                <View style={homeStyles.filterField}>
                  <Text style={homeStyles.filterLabel}>Category</Text>
                  <TouchableOpacity
                    style={[
                      homeStyles.filterSelect,
                      activePicker === 'category' && homeStyles.filterSelectActive,
                    ]}
                    onPress={() => togglePicker('category')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Select category"
                  >
                    <Text style={homeStyles.filterSelectValue}>{activeCategoryLabel}</Text>
                    <Ionicons
                      name={activePicker === 'category' ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={palette.text}
                    />
                  </TouchableOpacity>
                  {activePicker === 'category' && (
                    <View style={homeStyles.filterOptionList}>
                      <ScrollView
                        style={homeStyles.filterOptionScroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                      >
                        {[...categories].map((category) => {
                          const isActive = draftFilters.category === category;
                          return (
                            <TouchableOpacity
                              key={category}
                              style={[
                                homeStyles.filterOption,
                                isActive && homeStyles.filterOptionActive,
                              ]}
                              onPress={() => handleDraftCategoryChange(category)}
                              accessibilityRole="button"
                              accessibilityLabel={`Filter by ${formatCategoryLabel(category)}`}
                              activeOpacity={0.85}
                            >
                              <Text
                                style={[
                                  homeStyles.filterOptionLabel,
                                  isActive && homeStyles.filterOptionLabelActive,
                                ]}
                              >
                                {formatCategoryLabel(category)}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <View style={homeStyles.filterRow}>
                  <View style={homeStyles.filterColumn}>
                    <Text style={homeStyles.filterLabel}>Country</Text>
                    <TouchableOpacity
                      style={[
                        homeStyles.filterSelect,
                        activePicker === 'country' && homeStyles.filterSelectActive,
                      ]}
                      onPress={() => togglePicker('country')}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel="Select country"
                    >
                      <Text
                        style={
                          draftFilters.country
                            ? homeStyles.filterSelectValue
                            : homeStyles.filterSelectPlaceholder
                        }
                      >
                        {activeCountryLabel}
                      </Text>
                      <Ionicons
                        name={activePicker === 'country' ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={palette.text}
                      />
                    </TouchableOpacity>
                    {activePicker === 'country' && (
                      <View style={homeStyles.filterOptionList}>
                        {countryOptions.length > 0 && (
                          <View style={homeStyles.filterOptionSearch}>
                            <Ionicons
                              name="search"
                              size={16}
                              color={palette.textSubtle}
                              style={homeStyles.filterOptionSearchIcon}
                            />
                            <TextInput
                              style={homeStyles.filterOptionSearchInput}
                              value={countrySearchTerm}
                              onChangeText={setCountrySearchTerm}
                              placeholder="Search countries"
                              placeholderTextColor={palette.textSubtle}
                              accessibilityLabel="Search countries"
                            />
                          </View>
                        )}
                        <ScrollView
                          style={homeStyles.filterOptionScroll}
                          keyboardShouldPersistTaps="handled"
                          showsVerticalScrollIndicator={false}
                        >
                          <TouchableOpacity
                            style={[
                              homeStyles.filterOption,
                              !draftFilters.country && homeStyles.filterOptionActive,
                            ]}
                            onPress={() => handleDraftCountryChange(undefined)}
                            activeOpacity={0.85}
                          >
                            <Text
                              style={[
                                homeStyles.filterOptionLabel,
                                !draftFilters.country && homeStyles.filterOptionLabelActive,
                              ]}
                            >
                              All countries
                            </Text>
                          </TouchableOpacity>
                          {filteredCountryOptions.length === 0 && (
                            <View style={homeStyles.filterOptionEmpty}>
                              <Text style={homeStyles.filterOptionEmptyText}>No matches</Text>
                            </View>
                          )}
                          {filteredCountryOptions.map((option) => {
                            const isActive = draftFilters.country === option;
                            return (
                              <TouchableOpacity
                                key={option}
                                style={[
                                  homeStyles.filterOption,
                                  isActive && homeStyles.filterOptionActive,
                                ]}
                                onPress={() => handleDraftCountryChange(option)}
                                activeOpacity={0.85}
                              >
                                <Text
                                  style={[
                                    homeStyles.filterOptionLabel,
                                    isActive && homeStyles.filterOptionLabelActive,
                                  ]}
                                >
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  <View style={homeStyles.filterColumn}>
                    <Text style={homeStyles.filterLabel}>Route</Text>
                    <TouchableOpacity
                      style={[
                        homeStyles.filterSelect,
                        activePicker === 'route' && homeStyles.filterSelectActive,
                      ]}
                      onPress={() => togglePicker('route')}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel="Select route"
                    >
                      <Text
                        style={
                          draftFilters.route
                            ? homeStyles.filterSelectValue
                            : homeStyles.filterSelectPlaceholder
                        }
                      >
                        {activeRouteLabel}
                      </Text>
                      <Ionicons
                        name={activePicker === 'route' ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={palette.text}
                      />
                    </TouchableOpacity>
                    {activePicker === 'route' && (
                      <View style={homeStyles.filterOptionList}>
                        {routeOptions.length > 0 && (
                          <View style={homeStyles.filterOptionSearch}>
                            <Ionicons
                              name="search"
                              size={16}
                              color={palette.textSubtle}
                              style={homeStyles.filterOptionSearchIcon}
                            />
                            <TextInput
                              style={homeStyles.filterOptionSearchInput}
                              value={routeSearchTerm}
                              onChangeText={setRouteSearchTerm}
                              placeholder="Search routes"
                              placeholderTextColor={palette.textSubtle}
                              accessibilityLabel="Search routes"
                            />
                          </View>
                        )}
                        <ScrollView
                          style={homeStyles.filterOptionScroll}
                          keyboardShouldPersistTaps="handled"
                          showsVerticalScrollIndicator={false}
                        >
                          <TouchableOpacity
                            style={[
                              homeStyles.filterOption,
                              !draftFilters.route && homeStyles.filterOptionActive,
                            ]}
                            onPress={() => handleDraftRouteChange(undefined)}
                            activeOpacity={0.85}
                          >
                            <Text
                              style={[
                                homeStyles.filterOptionLabel,
                                !draftFilters.route && homeStyles.filterOptionLabelActive,
                              ]}
                            >
                              All routes
                            </Text>
                          </TouchableOpacity>
                          {filteredRouteOptions.length === 0 && (
                            <View style={homeStyles.filterOptionEmpty}>
                              <Text style={homeStyles.filterOptionEmptyText}>No matches</Text>
                            </View>
                          )}
                          {filteredRouteOptions.map((option) => {
                            const isActive = draftFilters.route === option;
                            return (
                              <TouchableOpacity
                                key={option}
                                style={[
                                  homeStyles.filterOption,
                                  isActive && homeStyles.filterOptionActive,
                                ]}
                                onPress={() => handleDraftRouteChange(option)}
                                activeOpacity={0.85}
                              >
                                <Text
                                  style={[
                                    homeStyles.filterOptionLabel,
                                    isActive && homeStyles.filterOptionLabelActive,
                                  ]}
                                >
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
                <View style={homeStyles.filterField}>
                  <Text style={homeStyles.filterLabel}>Posted</Text>
                  <TouchableOpacity
                    style={[
                      homeStyles.filterSelect,
                      activePicker === 'recency' && homeStyles.filterSelectActive,
                    ]}
                    onPress={() => togglePicker('recency')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Select recency"
                  >
                    <Text style={homeStyles.filterSelectValue}>{activeRecencyLabel}</Text>
                    <Ionicons
                      name={activePicker === 'recency' ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={palette.text}
                    />
                  </TouchableOpacity>
                  {activePicker === 'recency' && (
                    <View style={homeStyles.filterOptionList}>
                      <ScrollView
                        style={homeStyles.filterOptionScroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                      >
                        {recencyOptions.map((option) => {
                          const isActive = draftFilters.recency === option.value;
                          return (
                            <TouchableOpacity
                              key={option.label}
                              style={[
                                homeStyles.filterOption,
                                isActive && homeStyles.filterOptionActive,
                              ]}
                              onPress={() => handleDraftRecencyChange(option.value)}
                              activeOpacity={0.85}
                            >
                              <Text
                                style={[
                                  homeStyles.filterOptionLabel,
                                  isActive && homeStyles.filterOptionLabelActive,
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <View style={homeStyles.filterField}>
                  <Text style={homeStyles.filterLabel}>Sort</Text>
                  <TouchableOpacity
                    style={[
                      homeStyles.filterSelect,
                      activePicker === 'sort' && homeStyles.filterSelectActive,
                    ]}
                    onPress={() => togglePicker('sort')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Select sort order"
                  >
                    <Text style={homeStyles.filterSelectValue}>{activeSortLabel}</Text>
                    <Ionicons
                      name={activePicker === 'sort' ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={palette.text}
                    />
                  </TouchableOpacity>
                  {activePicker === 'sort' && (
                    <View style={homeStyles.filterOptionList}>
                      <ScrollView
                        style={homeStyles.filterOptionScroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                      >
                        {sortOptions.map((option) => {
                          const isActive = draftFilters.sortOrder === option.value;
                          return (
                            <TouchableOpacity
                              key={option.label}
                              style={[
                                homeStyles.filterOption,
                                isActive && homeStyles.filterOptionActive,
                              ]}
                              onPress={() => handleDraftSortChange(option.value)}
                              activeOpacity={0.85}
                            >
                              <Text
                                style={[
                                  homeStyles.filterOptionLabel,
                                  isActive && homeStyles.filterOptionLabelActive,
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
            <View style={homeStyles.filterFooter}>
              <TouchableOpacity
                style={homeStyles.filterSecondaryButton}
                onPress={handleResetFilters}
                accessibilityRole="button"
                accessibilityLabel="Reset filters"
                activeOpacity={0.8}
              >
                <Text style={homeStyles.filterSecondaryLabel}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={homeStyles.filterPrimaryButton}
                onPress={handleApplyFilters}
                accessibilityRole="button"
                accessibilityLabel="Apply filters"
                activeOpacity={0.9}
              >
                <Text style={homeStyles.filterPrimaryLabel}>Apply filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;
