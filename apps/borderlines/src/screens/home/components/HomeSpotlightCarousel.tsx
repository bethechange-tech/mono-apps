import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView as ScrollViewComponent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme';
import { homeStyles } from '../../home.styles';
import type { Story } from '@/modules/story';

type HomeSpotlightCarouselProps = {
  stories: Story[];
  onPressStory: (story: Story) => void;
  onToggleBookmark: (story: Story) => void;
  isStoryBookmarked: (storyId: string) => boolean;
};

export const HomeSpotlightCarousel: React.FC<HomeSpotlightCarouselProps> = ({
  stories,
  onPressStory,
  onToggleBookmark,
  isStoryBookmarked,
}) => {
  const scrollRef = useRef<ScrollViewComponent>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    if (stories.length > 0) {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [stories.length]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      if (width > 0 && width !== carouselWidth) {
        setCarouselWidth(width);
      }
    },
    [carouselWidth]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (carouselWidth === 0 || stories.length === 0) {
        return;
      }
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / carouselWidth);
      const clamped = Math.max(0, Math.min(nextIndex, stories.length - 1));
      setActiveIndex(clamped);
    },
    [carouselWidth, stories.length]
  );

  if (!stories.length) {
    return null;
  }

  return (
    <View style={homeStyles.featuredSection}>
      <Text style={homeStyles.featuredLabel}>Spotlight</Text>
      <View style={homeStyles.featuredCarouselContainer} onLayout={handleLayout}>
        {carouselWidth > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            style={homeStyles.featuredCarouselScroll}
            contentContainerStyle={homeStyles.featuredCarouselContent}
          >
            {stories.map((story) => {
              const isLaw = story.category === 'law';
              const isBookmarked = isStoryBookmarked(story.id);
              const primaryImage = story.images?.[0];

              return (
                <View
                  key={story.id}
                  style={[homeStyles.featuredCarouselItem, { width: carouselWidth }]}
                >
                  <TouchableOpacity
                    style={[homeStyles.featuredCard, homeStyles.featuredCarouselCard]}
                    activeOpacity={0.85}
                    onPress={() => onPressStory(story)}
                  >
                    {primaryImage && (
                      <Image source={{ uri: primaryImage }} style={homeStyles.featuredImage} />
                    )}
                    <View style={homeStyles.featuredContent}>
                      <View style={homeStyles.featuredHeaderRow}>
                        <View style={homeStyles.featuredCategoryPill}>
                          <Ionicons
                            name={isLaw ? 'scale-outline' : 'people-outline'}
                            size={14}
                            color="#FFFFFF"
                          />
                          <Text style={homeStyles.featuredCategoryText}>
                            {isLaw ? 'LAW SPOTLIGHT' : 'COMMUNITY STORY'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            homeStyles.featuredBookmarkButton,
                            isBookmarked && homeStyles.featuredBookmarkActive,
                          ]}
                          onPress={(event) => {
                            event.stopPropagation?.();
                            onToggleBookmark(story);
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={
                            isBookmarked ? 'Remove spotlight story from bookmarks' : 'Save spotlight story'
                          }
                        >
                          <Ionicons
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={16}
                            color={isBookmarked ? '#FFFFFF' : 'rgba(255,255,255,0.85)'}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={homeStyles.featuredTitle}>{story.title}</Text>
                      <Text style={homeStyles.featuredSummary} numberOfLines={3}>
                        {story.summary}
                      </Text>
                      <View style={homeStyles.featuredFooterRow}>
                        <View style={homeStyles.featuredMetaRow}>
                          <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                          <Text style={homeStyles.featuredMetaText}>{story.daysAgo} days ago</Text>
                        </View>
                        <TouchableOpacity
                          style={homeStyles.featuredButton}
                          onPress={(event) => {
                            event.stopPropagation?.();
                            onPressStory(story);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={homeStyles.featuredButtonLabel}>Read story</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
      <View style={homeStyles.featuredPagination}>
        {stories.map((story, index) => (
          <View
            key={story.id}
            style={[
              homeStyles.featuredPaginationDot,
              index === activeIndex && homeStyles.featuredPaginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeSpotlightCarousel;
