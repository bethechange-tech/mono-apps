import React, { memo, useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../../home.styles';
import { palette, theme } from '@/theme';
import type { Story } from '@/modules/story';

type HomeStoryCardProps = {
  story: Story;
  showLikes: boolean;
  isBookmarked: boolean;
  onPress: (story: Story) => void;
  onToggleBookmark: (story: Story) => void;
};

type TagItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: boolean;
};

const HomeStoryCardComponent = ({
  story,
  showLikes,
  isBookmarked,
  onPress,
  onToggleBookmark,
}: HomeStoryCardProps) => {
  const { width } = useWindowDimensions();
  const isStackedCard = width < 480;
  const isUltraCompact = width < 360;

  const responsiveStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: isStackedCard ? 'column' : 'row',
        },
        cardMedia: {
          width: isStackedCard ? '100%' : 120,
          height: isStackedCard ? (isUltraCompact ? 152 : 196) : undefined,
        },
        cardContent: {
          paddingHorizontal: isStackedCard ? 20 : 16,
          paddingVertical: isStackedCard ? 18 : 14,
          gap: 10,
        },
        cardHeaderRow: {
          flexDirection: isStackedCard ? 'column' : 'row',
          alignItems: isStackedCard ? 'flex-start' : 'center',
          gap: isStackedCard ? 8 : 0,
        },
        cardHeaderRight: {
          flexWrap: 'wrap',
          justifyContent: isStackedCard ? 'flex-start' : 'flex-end',
          alignItems: isStackedCard ? 'flex-start' : 'center',
          alignSelf: isStackedCard ? 'stretch' : 'auto',
          gap: isStackedCard ? 8 : 12,
        },
        tagRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 6,
          justifyContent: isStackedCard ? 'flex-start' : 'flex-end',
          marginTop: isStackedCard ? 4 : 0,
        },
        cardSummary: {
          ...theme.typography.caption,
          color: palette.textSubtle,
          lineHeight: isStackedCard ? 20 : 18,
        },
        cardMetaRow: {
          flexWrap: 'wrap',
          marginTop: isStackedCard ? 12 : 10,
          gap: isStackedCard ? 10 : 12,
        },
        footerCTA: {
          marginTop: isStackedCard ? 16 : 12,
        },
      }),
    [isStackedCard, isUltraCompact]
  );

  const cardTitleLineLimit = isStackedCard ? (isUltraCompact ? 4 : 3) : 2;
  const cardSummaryLineLimit = isStackedCard ? (isUltraCompact ? 5 : 4) : 2;

  const isLaw = story.category === 'law';
  const categoryLabel = isLaw ? 'LAW' : 'PERSONAL';
  const isNew = story.daysAgo <= 2;
  const primaryImage = story.images?.[0];
  const accentStyle = isLaw ? homeStyles.cardAccentLaw : homeStyles.cardAccentPersonal;
  const accentChipStyle = isLaw ? styles.tagChipLaw : styles.tagChipPersonal;
  const accentChipTextStyle = isLaw ? styles.tagChipLawText : styles.tagChipPersonalText;
  const accentChipIconColor = isLaw ? '#1D4ED8' : '#BE185D';

  const tagItems = useMemo<TagItem[]>(() => {
    const items: TagItem[] = [];
    if (story.countryTag) {
      items.push({
        key: `country-${story.countryTag}`,
        label: story.countryTag,
        icon: 'flag-outline',
      });
    }
    if (story.routeTag) {
      items.push({
        key: `route-${story.routeTag}`,
        label: story.routeTag,
        icon: 'map-outline',
        accent: true,
      });
    }
    return items;
  }, [story.countryTag, story.routeTag]);

  const daysAgoLabel = story.daysAgo <= 0 ? 'Today' : story.daysAgo === 1 ? 'Yesterday' : `${story.daysAgo} days ago`;
  const likesLabel = Number.isFinite(story.likes)
    ? `${story.likes >= 10 ? Math.round(story.likes) : story.likes.toFixed(1)}k likes`
    : '0 likes';

  return (
    <TouchableOpacity
      style={[homeStyles.card, responsiveStyles.card]}
      activeOpacity={0.85}
      onPress={() => onPress(story)}
      accessibilityRole="button"
      accessibilityLabel={`${story.title}. ${categoryLabel.toLowerCase()} story.`}
      accessibilityHint="Opens the full story details"
      testID={`story-card-${story.id}`}
    >
      <View style={[homeStyles.cardMedia, responsiveStyles.cardMedia]}>
        {primaryImage ? (
          <Image
            source={{ uri: primaryImage }}
            style={homeStyles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[homeStyles.cardMediaFallback, accentStyle]}>
            <Ionicons
              name={isLaw ? 'scale-outline' : 'people-outline'}
              size={22}
              color="#FFFFFF"
            />
          </View>
        )}
      </View>
      <View style={[homeStyles.cardContent, responsiveStyles.cardContent]}>
        <View style={[homeStyles.cardHeaderRow, responsiveStyles.cardHeaderRow]}>
          <View style={homeStyles.cardHeaderLeft}>
            <Text style={homeStyles.cardCategoryLabel}>{categoryLabel}</Text>
            {isNew && <Text style={homeStyles.cardNewBadge}>NEW</Text>}
          </View>
          <View style={[homeStyles.cardHeaderRight, responsiveStyles.cardHeaderRight]}>
            {tagItems.length > 0 && (
              <View style={[styles.tagRow, responsiveStyles.tagRow]}>
                {tagItems.map((item) => (
                  <View
                    key={item.key}
                    style={[styles.tagChip, item.accent && accentChipStyle]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={12}
                      color={item.accent ? accentChipIconColor : palette.textMuted}
                      style={styles.tagChipIcon}
                    />
                    <Text
                      style={[styles.tagChipText, item.accent && accentChipTextStyle]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[
                homeStyles.cardBookmarkButton,
                isBookmarked && homeStyles.cardBookmarkActive,
              ]}
              onPress={(event) => {
                event.stopPropagation?.();
                onToggleBookmark(story);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={
                isBookmarked ? 'Remove story from bookmarks' : 'Save story for later'
              }
              hitSlop={BOOKMARK_HIT_SLOP}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={isBookmarked ? '#FFFFFF' : palette.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={homeStyles.cardSource}>{story.subtitle}</Text>
        <Text style={homeStyles.cardTitle} numberOfLines={cardTitleLineLimit}>
          {story.title}
        </Text>
        {!!story.summary && (
          <Text style={responsiveStyles.cardSummary} numberOfLines={cardSummaryLineLimit}>
            {story.summary}
          </Text>
        )}
        <View style={[styles.metaRow, responsiveStyles.cardMetaRow]}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={palette.textMuted} />
            <Text style={styles.metaText}>{daysAgoLabel}</Text>
          </View>
          {showLikes && (
            <View style={styles.metaItem}>
              <Ionicons name="heart-outline" size={14} color={palette.primary} />
              <Text style={[styles.metaText, styles.metaLikes]}>{likesLabel}</Text>
            </View>
          )}
        </View>
        <View style={[styles.footerCTA, responsiveStyles.footerCTA]}>
          <Text style={styles.footerText}>Read story</Text>
          <Ionicons name="chevron-forward" size={14} color={palette.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BOOKMARK_HIT_SLOP = { top: 10, right: 10, bottom: 10, left: 10 } as const;

const styles = StyleSheet.create({
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
  },
  tagChipLaw: {
    backgroundColor: '#DBEAFE',
  },
  tagChipPersonal: {
    backgroundColor: '#FCE7F3',
  },
  tagChipText: {
    ...theme.typography.caption,
    color: palette.textMuted,
    fontSize: 12,
  },
  tagChipLawText: {
    color: '#1D4ED8',
  },
  tagChipPersonalText: {
    color: '#BE185D',
  },
  tagChipIcon: {
    marginRight: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...theme.typography.caption,
    color: palette.textSubtle,
  },
  metaLikes: {
    color: palette.primary,
    fontWeight: '600',
  },
  footerCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  footerText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: palette.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

export const HomeStoryCard = memo(HomeStoryCardComponent);
