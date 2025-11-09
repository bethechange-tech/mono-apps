import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';
import { useBookmarkStore } from '@/modules/bookmark';
import { useStoryStore, Story } from '@/modules/story';
import { featureFlags } from '@/config/featureFlags';
import type { ArticleDetailRouteParams } from './articleDetail.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SHOW_LIKES = featureFlags.showLikes;

const ArticleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ArticleDetailRouteParams, 'ArticleDetail'>>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
  const stories = useStoryStore((state) => state.stories);
  const getStoryById = useStoryStore((state) => state.getStoryById);
  const loadStories = useStoryStore((state) => state.loadStories);
  const isLoadingStories = useStoryStore((state) => state.isLoading);
  const hasLoadedStories = useStoryStore((state) => state.hasLoaded);

  const passedStory = route.params?.story;
  const resolvedStoryId = route.params?.storyId ?? passedStory?.id;
  const isBookmarked = useBookmarkStore((state) =>
    resolvedStoryId ? state.bookmarks.some((item) => item.id === resolvedStoryId) : false
  );

  const fallbackStoryFromList = resolvedStoryId ? getStoryById(resolvedStoryId) : stories[0];
  const story = passedStory ?? fallbackStoryFromList;

  useEffect(() => {
    if (!hasLoadedStories && !isLoadingStories) {
      loadStories().catch(() => {});
    }
  }, [hasLoadedStories, isLoadingStories, loadStories]);

  if (!story && (isLoadingStories || !hasLoadedStories)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.root}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={navigation.goBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={palette.text} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Story</Text>
            <View style={styles.topBarRightPlaceholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.loadingText}>Loading story…</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!story) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.root}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={navigation.goBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={palette.text} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Story</Text>
            <View style={styles.topBarRightPlaceholder} />
          </View>
          <View style={styles.missingContainer}>
            <Text style={styles.missingText}>
              We couldn’t find this story.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isLaw = story.category === 'law';
  const categoryLabel = isLaw ? 'LAW' : 'PERSONAL';
  const accentColor = isLaw ? '#2563EB' : '#EC4899';

  const images = story.images ?? [];

  const resourceLinks = useMemo(() => {
    const resources = [] as { label: string; description: string }[];
    if (story.routeTag) {
      resources.push({
        label: `${story.routeTag} guidance`,
        description: 'Official overview, eligibility and evidence requirements.',
      });
    }
    if (story.countryTag) {
      resources.push({
        label: `${story.countryTag} immigration updates`,
        description: 'Latest government announcements and policy changes.',
      });
    }
    resources.push({
      label: 'Find regulated advice',
      description: 'Search OISC/ICCRC registers for qualified advisers.',
    });
    return resources;
  }, [story.countryTag, story.routeTag]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: story.title,
        message: `${story.title} — shared from Borderlines`,
      });
    } catch (error) {
      // no-op if user dismisses share sheet
    }
  };

  const handleBookmarkToggle = () => {
    toggleBookmark({
      id: story.id,
      title: story.title,
      subtitle: story.subtitle,
      category: story.category,
      countryTag: story.countryTag,
      routeTag: story.routeTag,
      daysAgo: story.daysAgo,
      likes: story.likes,
    });
  };

  const handleResourcePress = (label: string) => {
    Alert.alert('Coming soon', `We will surface links for "${label}" in a future update.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={palette.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Story</Text>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.topBarActionButton}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={18} color={palette.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBookmarkToggle}
              style={[styles.topBarActionButton, isBookmarked && styles.topBarActionButtonActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isBookmarked ? '#FFFFFF' : palette.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Images carousel */}
          {images.length > 0 && (
            <View style={styles.carouselWrapper}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {images.map((uri, idx) => (
                  <Image
                    key={uri + idx}
                    source={{ uri }}
                    style={styles.carouselImage}
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.carouselDots}>
                  {images.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dotIndicator,
                        idx === activeImageIndex && styles.dotIndicatorActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Hero card */}
          <View style={styles.heroCard}>
            <View
              style={[styles.heroAccent, { backgroundColor: accentColor }]}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroHeaderRow}>
                <Text style={styles.categoryLabel}>{categoryLabel}</Text>
                {(story.countryTag || story.routeTag) && (
                  <Text style={styles.tagText} numberOfLines={1}>
                    {[story.countryTag, story.routeTag]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                )}
              </View>
              <Text style={styles.sourceText}>{story.subtitle}</Text>
              <Text style={styles.title}>{story.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{story.daysAgo} days ago</Text>
                {SHOW_LIKES && (
                  <>
                    <View style={styles.dot} />
                    <Text style={styles.metaText}>{story.likes}k likes</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Summary / journey */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {isLaw ? 'Summary of change' : 'Journey overview'}
            </Text>
            <Text style={styles.body}>{story.summary}</Text>
          </View>

          {/* Key details */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Key details</Text>
            <View style={styles.chipRow}>
              {story.countryTag && (
                <View style={styles.infoChip}>
                  <Ionicons
                    name="flag-outline"
                    size={14}
                    color={palette.textSubtle}
                    style={styles.chipIcon}
                  />
                  <Text style={styles.infoChipText}>{story.countryTag}</Text>
                </View>
              )}
              {story.routeTag && (
                <View style={styles.infoChip}>
                  <Ionicons
                    name="briefcase-outline"
                    size={14}
                    color={palette.textSubtle}
                    style={styles.chipIcon}
                  />
                  <Text style={styles.infoChipText}>{story.routeTag}</Text>
                </View>
              )}
              <View style={styles.infoChip}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={palette.textSubtle}
                  style={styles.chipIcon}
                />
                <Text style={styles.infoChipText}>
                  {story.daysAgo} days ago
                </Text>
              </View>
              {SHOW_LIKES && (
                <View style={styles.infoChip}>
                  <Ionicons
                    name="heart-outline"
                    size={14}
                    color={palette.textSubtle}
                    style={styles.chipIcon}
                  />
                  <Text style={styles.infoChipText}>
                    {story.likes}k likes
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.body, { marginTop: 8 }]}>
              {story.keyDetails}
            </Text>
          </View>

          {resourceLinks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Suggested resources</Text>
              <View style={styles.resourceList}>
                {resourceLinks.map((resource, index) => (
                  <TouchableOpacity
                    key={resource.label}
                    style={[
                      styles.resourceItem,
                      index === resourceLinks.length - 1 && styles.resourceItemLast,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleResourcePress(resource.label)}
                  >
                    <View
                      style={[styles.resourceIconWrapper, { backgroundColor: `${accentColor}11` }]}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color={accentColor}
                      />
                    </View>
                    <View style={styles.resourceTextCol}>
                      <Text style={styles.resourceTitle}>{resource.label}</Text>
                      <Text style={styles.resourceDescription}>{resource.description}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={palette.textSubtle}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Meaning / learning */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {isLaw ? 'What this means' : 'What they learned'}
            </Text>
            <Text style={styles.body}>{story.meaning}</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const IMAGE_HEIGHT = 210;
const H_PADDING = 24;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  root: {
    flex: 1,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  topBarRightPlaceholder: {
    width: 32,
    height: 32,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  topBarActionButtonActive: {
    backgroundColor: palette.primary,
  },

  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 96,
  },

  carouselWrapper: {
    marginTop: 12,
    marginBottom: 18,
    borderRadius: 24,
    overflow: 'hidden',
  },
  carouselImage: {
    width: SCREEN_WIDTH - H_PADDING * 2,
    height: IMAGE_HEIGHT,
    borderRadius: 24,
    backgroundColor: palette.surfaceAlt ?? '#E5E7EB',
  },
  carouselDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 3,
  },
  dotIndicatorActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  heroCard: {
    marginTop: 4,
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroAccent: {
    width: 10,
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    ...theme.typography.caption,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: palette.textSubtle,
  },
  tagText: {
    ...theme.typography.caption,
    color: palette.textMuted,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  sourceText: {
    ...theme.typography.caption,
    color: palette.textSubtle,
    marginBottom: 6,
  },
  title: {
    ...theme.typography.title,
    color: palette.text,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...theme.typography.caption,
    color: palette.textSubtle,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.divider,
    marginHorizontal: 8,
  },

  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  body: {
    ...theme.typography.body,
    color: palette.text,
    lineHeight: 22,
  },
  calloutCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    borderLeftWidth: 4,
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  calloutIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calloutBody: {
    flex: 1,
  },
  calloutTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: palette.textSubtle,
    marginBottom: 4,
  },
  calloutText: {
    ...theme.typography.body,
    color: palette.text,
    lineHeight: 20,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },
  chipIcon: {
    marginRight: 4,
  },
  infoChipText: {
    ...theme.typography.caption,
    color: palette.textSubtle,
  },
  resourceList: {
    marginTop: 10,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    marginBottom: 10,
  },
  resourceItemLast: {
    marginBottom: 0,
  },
  resourceIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceTextCol: {
    flex: 1,
  },
  resourceTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: palette.text,
  },
  resourceDescription: {
    ...theme.typography.caption,
    color: palette.textMuted,
    marginTop: 2,
  },

  missingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  missingText: {
    ...theme.typography.body,
    color: palette.textMuted,
  },
  loadingText: {
    ...theme.typography.caption,
    color: palette.textMuted,
    marginTop: 12,
  },
});

export default ArticleDetailScreen;