import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { palette, theme } from '@/theme';
import { useBookmarkStore, useBookmarkHydration } from '@/modules/bookmark';
const formatSavedLabel = (savedAt: string) => {
  const parsed = new Date(savedAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'Saved just now';
  }

  const diffMs = Date.now() - parsed.getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) {
    return 'Saved just now';
  }

  if (diffMs < hourMs) {
    const minutes = Math.round(diffMs / minuteMs);
    return `Saved ${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.round(diffMs / hourMs);
    return `Saved ${hours} hr${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.round(diffMs / dayMs);
  if (days < 7) {
    return `Saved ${days} day${days === 1 ? '' : 's'} ago`;
  }

  return `Saved on ${parsed.toLocaleDateString()}`;
};

const BookmarkScreen = () => {
  const navigation = useNavigation();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const isHydrated = useBookmarkHydration();
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const clearBookmarks = useBookmarkStore((state) => state.clearBookmarks);

  const hasBookmarks = bookmarks.length > 0;

  const handleBrowseStories = () => {
    navigation.navigate('HomeTab' as never);
  };

  const handleClearAll = () => {
    if (!hasBookmarks) {
      return;
    }

    Alert.alert(
      'Remove all bookmarks?',
      'This clears every saved story from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: clearBookmarks,
        },
      ]
    );
  };

  const handleBookmarkPress = (storyId: string) => {
    navigation.navigate('HomeTab' as never, {
      screen: 'ArticleDetail',
      params: { storyId },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerTitle}>Bookmarks</Text>
              <Text style={styles.headerSubtitle}>Saved stories to revisit later</Text>
            </View>
            {hasBookmarks && (
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.headerAction}
                accessibilityRole="button"
                accessibilityLabel="Clear all bookmarks"
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={palette.primary} />
                <Text style={styles.headerActionLabel}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerHint}>
            <Ionicons
              name="bookmark-outline"
              size={16}
              color={palette.primary}
              style={styles.headerHintIcon}
            />
            <Text style={styles.headerHintText}>
              Stories you save stay on this device so you can revisit them any time.
            </Text>
          </View>
        </View>

        {!isHydrated ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={palette.primary} />
            <Text style={styles.loadingLabel}>Loading your saved stories...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            {!hasBookmarks && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                  <Ionicons name="bookmark-outline" size={26} color={palette.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No bookmarks yet</Text>
                <Text style={styles.emptyBody}>
                  Save immigration stories from Discover to read or share later.
                </Text>
                <TouchableOpacity
                  onPress={handleBrowseStories}
                  style={styles.emptyAction}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={styles.emptyActionLabel}>Browse stories</Text>
                </TouchableOpacity>
              </View>
            )}

            {bookmarks.map((story) => {
              const isLaw = story.category === 'law';
              const accentColor = isLaw ? '#2563EB' : '#EC4899';
              const categoryLabel = isLaw ? 'LAW' : 'PERSONAL';
              const savedLabel = formatSavedLabel(story.savedAt);

              return (
                <TouchableOpacity
                  key={story.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => handleBookmarkPress(story.id)}
                >
                  <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardCategory}>{categoryLabel}</Text>
                      {(story.countryTag || story.routeTag) && (
                        <Text style={styles.cardTag} numberOfLines={1}>
                          {[story.countryTag, story.routeTag].filter(Boolean).join(' · ')}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.cardSource}>{story.subtitle}</Text>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {story.title}
                    </Text>
                    <View style={styles.cardMetaRow}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={palette.textSubtle}
                        style={styles.metaIcon}
                      />
                      <Text style={styles.cardMeta}>{story.daysAgo} days ago</Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.savedMeta}>{savedLabel}</Text>
                      <TouchableOpacity
                        onPress={() => removeBookmark(story.id)}
                        style={styles.removeBookmarkButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${story.title} from bookmarks`}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={14} color={palette.textMuted} />
                        <Text style={styles.removeBookmarkLabel}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  root: {
    flex: 1,
  },

  headerCard: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: palette.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1F2933',
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTitle: {
    ...theme.typography.subtitle,
    color: palette.text,
  },
  headerSubtitle: {
    marginTop: 4,
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: `${palette.primary}14`,
  },
  headerActionLabel: {
    ...theme.typography.caption,
    color: palette.primary,
    fontWeight: '500',
  },
  headerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  headerHintIcon: {
    marginTop: 2,
  },
  headerHintText: {
    flex: 1,
    ...theme.typography.caption,
    color: palette.textSubtle,
    lineHeight: 18,
  },

  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 14,
  },

  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingLabel: {
    ...theme.typography.caption,
    color: palette.textMuted,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    marginBottom: 12,
  },
  emptyTitle: {
    ...theme.typography.body,
    color: palette.text,
    marginBottom: 4,
  },
  emptyBody: {
    ...theme.typography.caption,
    color: palette.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyAction: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: palette.primary,
  },
  emptyActionLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  card: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: palette.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardAccent: {
    width: 8,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardCategory: {
    ...theme.typography.caption,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: palette.textSubtle,
  },
  cardTag: {
    ...theme.typography.caption,
    color: palette.textMuted,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  cardSource: {
    ...theme.typography.caption,
    color: palette.textSubtle,
    marginBottom: 4,
  },
  cardTitle: {
    ...theme.typography.body,
    color: palette.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  cardMeta: {
    ...theme.typography.caption,
    color: palette.textSubtle,
  },
  cardFooter: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  savedMeta: {
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  removeBookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: palette.surface,
  },
  removeBookmarkLabel: {
    ...theme.typography.caption,
    color: palette.textMuted,
  },
});

export default BookmarkScreen;