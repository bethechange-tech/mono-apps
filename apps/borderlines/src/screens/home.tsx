import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { DateFilterOption, HomeNavigationProp } from './home.types';
import { useHomeScreenState } from './home.hooks';
import { homeStyles } from './home.styles';
import { HomeHeader } from './home/components/HomeHeader';
import type { Story } from '@/modules/story';
import { HomeLoadingState } from './home/components/HomeLoadingState';
import { HomeResultsHeader } from './home/components/HomeResultsHeader';
import { HomeResultsMeta } from './home/components/HomeResultsMeta';
import { HomeDateControls } from './home/components/HomeDateControls';
import { HomeSpotlightCarousel } from './home/components/HomeSpotlightCarousel';
import { HomeStoryList } from './home/components/HomeStoryList';
import { HomeEmptyState } from './home/components/HomeEmptyState';

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const { SHOW_LIKES, filters, data, meta, actions, ui } = useHomeScreenState();

  const {
    selectedCategory,
    setSelectedCategory,
    query,
    setQuery,
    dateFilter,
    setDateFilter,
    dateSortOrder,
    countryFilter,
    setCountryFilter,
    routeFilter,
    setRouteFilter,
    showCountryOptions,
    setShowCountryOptions,
    showRouteOptions,
    setShowRouteOptions,
    filteredCountryOptions,
    filteredRouteOptions,
    activeFilterChips,
    handleResetFilters,
    toggleDateSortOrder,
    isFiltered,
  } = filters;

  const {
    hasResults,
    spotlightStories,
    remainingStories,
    resultsLabel,
    newStoriesLabel,
    bookmarkLabel,
    bookmarkCount,
  } = data;

  const { hasLoadedStories, isLoadingStories } = meta;

  const { handleToggleBookmark: toggleBookmark, isStoryBookmarked } = actions;

  const { showEncouragement, setShowEncouragement } = ui;

  const handleCreateStory = () => {
    navigation.navigate('CreateStory');
  };

  const handlePressStory = (story: Story) => {
    navigation.navigate('ArticleDetail', { story, storyId: story.id });
  };

  const handleDismissEncouragement = useCallback(() => {
    setShowEncouragement(false);
  }, [setShowEncouragement]);

  const handleChangeCountryFilter = useCallback(
    (text: string) => {
      setCountryFilter(text);
      setShowCountryOptions(true);
    },
    [setCountryFilter, setShowCountryOptions]
  );

  const handleSelectCountryOption = useCallback(
    (option: string) => {
      setCountryFilter(option);
      setShowCountryOptions(false);
    },
    [setCountryFilter, setShowCountryOptions]
  );

  const handleClearCountryFilter = useCallback(() => {
    setCountryFilter('');
    setShowCountryOptions(false);
  }, [setCountryFilter, setShowCountryOptions]);

  const handleFocusCountryInput = useCallback(() => {
    setShowCountryOptions(true);
  }, [setShowCountryOptions]);

  const handleChangeRouteFilter = useCallback(
    (text: string) => {
      setRouteFilter(text);
      setShowRouteOptions(true);
    },
    [setRouteFilter, setShowRouteOptions]
  );

  const handleSelectRouteOption = useCallback(
    (option: string) => {
      setRouteFilter(option);
      setShowRouteOptions(false);
    },
    [setRouteFilter, setShowRouteOptions]
  );

  const handleClearRouteFilter = useCallback(() => {
    setRouteFilter('');
    setShowRouteOptions(false);
  }, [setRouteFilter, setShowRouteOptions]);

  const handleFocusRouteInput = useCallback(() => {
    setShowRouteOptions(true);
  }, [setShowRouteOptions]);

  const handleSelectDateFilter = useCallback(
    (option: DateFilterOption) => {
      setDateFilter(option);
    },
    [setDateFilter]
  );

  if (!hasLoadedStories && isLoadingStories) {
    return <HomeLoadingState />;
  }

  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <View style={homeStyles.root}>
        <View style={homeStyles.contentShell}>
          <View style={homeStyles.contentInner}>
            <HomeHeader
              query={query}
              onChangeQuery={setQuery}
              countryFilter={countryFilter}
              onChangeCountryFilter={handleChangeCountryFilter}
              onClearCountryFilter={handleClearCountryFilter}
              showCountryOptions={showCountryOptions}
              filteredCountryOptions={filteredCountryOptions}
              onSelectCountryOption={handleSelectCountryOption}
              onFocusCountryInput={handleFocusCountryInput}
              routeFilter={routeFilter}
              onChangeRouteFilter={handleChangeRouteFilter}
              onClearRouteFilter={handleClearRouteFilter}
              showRouteOptions={showRouteOptions}
              filteredRouteOptions={filteredRouteOptions}
              onSelectRouteOption={handleSelectRouteOption}
              onFocusRouteInput={handleFocusRouteInput}
              activeFilterChips={activeFilterChips}
              onResetFilters={handleResetFilters}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              showEncouragement={showEncouragement}
              onDismissEncouragement={handleDismissEncouragement}
              onCreateStory={handleCreateStory}
              resultsLabel={resultsLabel}
              isFiltered={isFiltered}
              isLoading={isLoadingStories}
            />

            <ScrollView
              contentContainerStyle={homeStyles.listScroll}
              showsVerticalScrollIndicator={false}
            >
              <HomeResultsHeader
                resultsLabel={resultsLabel}
                isFiltered={isFiltered}
                isLoading={isLoadingStories}
                onResetFilters={handleResetFilters}
              />

              <HomeResultsMeta
                hasResults={hasResults}
                newStoriesLabel={newStoriesLabel}
                bookmarkCount={bookmarkCount}
                bookmarkLabel={bookmarkLabel}
              />

              <HomeDateControls
                dateFilter={dateFilter}
                selectDateFilter={handleSelectDateFilter}
                dateSortOrder={dateSortOrder}
                toggleDateSortOrder={toggleDateSortOrder}
              />

              {hasResults && spotlightStories.length > 0 && (
                <HomeSpotlightCarousel
                  stories={spotlightStories}
                  onPressStory={handlePressStory}
                  onToggleBookmark={toggleBookmark}
                  isStoryBookmarked={isStoryBookmarked}
                />
              )}

              {hasResults ? (
                <HomeStoryList
                  stories={remainingStories}
                  showLikes={SHOW_LIKES}
                  isStoryBookmarked={isStoryBookmarked}
                  onPressStory={handlePressStory}
                  onToggleBookmark={toggleBookmark}
                />
              ) : (
                <HomeEmptyState onCreateStory={handleCreateStory} />
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
