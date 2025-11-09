import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { palette, theme } from '@/theme';
import type { StoragePost } from '@/data/posts';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { postRepository } from '@/features/posts/domain/postRepository';

const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (!parts.length) {
        return '?';
    }
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
    return initials || '?';
};

type SortOption = {
    label: 'Newest' | 'Oldest' | 'A-Z';
    icon: keyof typeof Ionicons.glyphMap;
};

type RootStackParamList = {
    Root: undefined;
    ListingDetail: { id: string };
    PostDetail: { id: string };
};

export function PostsScreen() {
    const [posts, setPosts] = useState<StoragePost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await postRepository.list();
            setPosts(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load stories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPosts();
    }, [loadPosts]);

    const categories = useMemo(() => {
        const categorySet = new Set<string>();
        posts.forEach((post) => {
            const category = post.storage.category;
            if (category) {
                categorySet.add(category);
            }
        });
        return ['All', ...Array.from(categorySet)];
    }, [posts]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const sortOptions = useMemo<SortOption[]>(
        () => [
            { label: 'Newest', icon: 'sparkles-outline' },
            { label: 'Oldest', icon: 'time-outline' },
            { label: 'A-Z', icon: 'text-outline' },
        ],
        [],
    );

    const [sortOption, setSortOption] = useState<SortOption['label']>('Newest');

    const filteredPosts = useMemo(() => {
        const base = activeCategory === 'All'
            ? posts
            : posts.filter((post) => post.storage.category === activeCategory);

        const sorted = [...base].sort((a, b) => {
            if (sortOption === 'A-Z') {
                return a.storage.title.localeCompare(b.storage.title);
            }

            const aTime = Date.parse(a.createdAt);
            const bTime = Date.parse(b.createdAt);
            if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
                return 0;
            }

            return sortOption === 'Newest' ? bTime - aTime : aTime - bTime;
        });

        return sorted;
    }, [activeCategory, posts, sortOption]);

    const heroFallback = useMemo(() => {
        if (!posts.length) {
            return undefined;
        }
        const ordered = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return ordered[0];
    }, [posts]);

    const heroPost = filteredPosts[0] ?? heroFallback;

    const resetFilters = useCallback(() => {
        setActiveCategory('All');
        setSortOption('Newest');
    }, []);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleOpenPost = useCallback((postId: string) => {
        navigation.navigate('PostDetail', { id: postId });
    }, [navigation]);

    if (loading && !posts.length) {
        return (
            <Screen>
                <View style={styles.statusContainer}>
                    <ActivityIndicator color={palette.primary} />
                    <Text style={styles.statusLabel}>Loading stories…</Text>
                </View>
            </Screen>
        );
    }

    if (error && !posts.length) {
        return (
            <Screen>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Unable to load stories</Text>
                    <Text style={styles.errorSubtitle}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={() => void loadPosts()}>
                        <Text style={styles.retryLabel}>Try again</Text>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={() => void loadPosts()}
                ListHeaderComponent={(<View style={styles.headerWrapper}>
                    {error ? (
                        <View style={styles.inlineError}>
                            <Text style={styles.inlineErrorTitle}>Issues fetching latest stories</Text>
                            <Text style={styles.inlineErrorSubtitle}>{error}</Text>
                            <Pressable style={styles.inlineRetryButton} onPress={() => void loadPosts()}>
                                <Text style={styles.inlineRetryLabel}>Retry</Text>
                            </Pressable>
                        </View>
                    ) : null}
                    <Header
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        sortOptions={sortOptions}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                        totalPosts={filteredPosts.length}
                        heroPost={heroPost}
                    />
                </View>)}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onPress={() => handleOpenPost(item.id)}
                    />
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={(<EmptyState onReset={resetFilters} />)}
                ListFooterComponent={filteredPosts.length ? <Footer /> : null}
            />
        </Screen>
    );
}

type HeaderProps = {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    sortOptions: SortOption[];
    sortOption: SortOption['label'];
    onSortChange: (option: SortOption['label']) => void;
    totalPosts: number;
    heroPost?: StoragePost;
};

const Header = ({
    categories,
    activeCategory,
    onCategoryChange,
    sortOptions,
    sortOption,
    onSortChange,
    totalPosts,
    heroPost,
}: HeaderProps) => {
    const heroImage = heroPost?.images?.[0] ?? heroPost?.storage.image;
    const heroCategory = heroPost?.storage.category ?? 'Storage';

    return (
        <View style={styles.header}>
            {heroImage ? (
                <ImageBackground
                    source={{ uri: heroImage }}
                    style={styles.heroImage}
                    imageStyle={styles.heroImageRadius}
                >
                    <View style={styles.heroOverlay} />
                    <View style={styles.heroContent}>
                        <View style={styles.heroBadgeRow}>
                            <View style={styles.heroBadge}>
                                <Text style={styles.heroBadgeText}>Latest insight</Text>
                            </View>
                            {heroPost ? (
                                <Text style={styles.heroMeta}>Updated {formatDate(heroPost.createdAt)}</Text>
                            ) : null}
                        </View>
                        <Text style={styles.heroTitle}>{heroPost?.storage.title ?? 'Storage Stories'}</Text>
                        <Text style={styles.heroSubTitle}>{heroPost?.storage.location ?? 'Fresh hosting guidance weekly'}</Text>
                        {heroPost ? (
                            <View style={styles.heroFooterRow}>
                                <View style={styles.heroAvatar}>
                                    <Text style={styles.heroAvatarLabel}>{getInitials(heroPost.user.name)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.heroFooterLabel}>From {heroPost.user.name}</Text>
                                    <Text style={styles.heroFooterMeta}>@{heroPost.user.username} · {heroCategory}</Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                </ImageBackground>
            ) : (
                <View style={styles.heroFallback}>
                    <Text style={styles.heroFallbackTitle}>Storage Stories</Text>
                    <Text style={styles.heroFallbackSubtitle}>Fresh hosting guidance weekly</Text>
                </View>
            )}

            <View style={styles.headerCard}>
                <View style={styles.headerIntro}>
                    <View style={{ flex: 1, gap: 8 }}>
                        <Text style={styles.heading}>Storage Stories</Text>
                        <Text style={styles.subheading}>
                            Curated guidance from hosts who keep their renters delighted. Browse insights by category and update cadence.
                        </Text>
                    </View>
                    <View style={styles.headerCountPill}>
                        <Text style={styles.headerCountLabel}>{totalPosts} posts</Text>
                    </View>
                </View>

                <View style={styles.controlsCard}>
                    <View style={styles.controlsHeader}>
                        <Text style={styles.controlsTitle}>Browse by category</Text>
                        <Text style={styles.controlsMeta}>{activeCategory === 'All' ? 'Showing everything' : `${activeCategory} focus`}</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScroll}
                    >
                        {categories.map((category) => {
                            const isActive = category === activeCategory;
                            return (
                                <Pressable
                                    key={category}
                                    onPress={() => onCategoryChange(category)}
                                    style={({ pressed }) => [
                                        styles.categoryChip,
                                        isActive && styles.categoryChipActive,
                                        pressed && styles.categoryChipPressed,
                                    ]}
                                >
                                    <Text style={[styles.categoryChipLabel, isActive && styles.categoryChipLabelActive]}>
                                        {category}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.sortSection}>
                        <Text style={styles.sortTitle}>Sort</Text>
                        <View style={styles.sortRow}>
                            {sortOptions.map(({ label, icon }) => {
                                const isActive = label === sortOption;
                                return (
                                    <Pressable
                                        key={label}
                                        onPress={() => onSortChange(label)}
                                        style={({ pressed }) => [
                                            styles.sortChip,
                                            isActive && styles.sortChipActive,
                                            pressed && styles.categoryChipPressed,
                                        ]}
                                    >
                                        <Ionicons
                                            name={icon}
                                            size={16}
                                            color={isActive ? palette.primary : palette.textSubtle}
                                        />
                                        <Text style={[styles.sortLabel, isActive && styles.sortLabelActive]}>
                                            {label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const EmptyState = ({ onReset }: { onReset: () => void }) => (
    <View style={styles.emptyState}>
        <View style={styles.emptyBadge}>
            <View style={styles.emptyBadgeDot} />
        </View>
        <Text style={styles.emptyTitle}>No stories just yet</Text>
        <Text style={styles.emptyDescription}>Try adjusting your filters to see more hosting tips.</Text>
        <Pressable onPress={onReset} style={styles.emptyButton}>
            <Text style={styles.emptyButtonLabel}>Reset filters</Text>
        </Pressable>
    </View>
);

const Footer = () => (
    <View style={styles.footer}>
        <Text style={styles.footerTitle}>More insights coming</Text>
        <Text style={styles.footerBody}>
            Hosts share their playbooks often. Save this space for seasonal refreshes, maintenance routines, and guest-ready upgrades.
        </Text>
    </View>
);

const styles = StyleSheet.create({
    statusContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 24,
        backgroundColor: palette.background,
    },
    statusLabel: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    errorContainer: {
        margin: 24,
        padding: 20,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        gap: 12,
    },
    errorTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    errorSubtitle: {
        ...theme.typography.body,
        color: palette.textMuted,
    },
    retryButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.primary,
    },
    retryLabel: {
        ...theme.typography.caption,
        color: palette.surface,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    headerWrapper: {
        gap: 16,
    },
    inlineError: {
        padding: 16,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        gap: 8,
    },
    inlineErrorTitle: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    inlineErrorSubtitle: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    inlineRetryButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: palette.surface,
    },
    inlineRetryLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    list: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 56,
        gap: 24,
        backgroundColor: palette.background,
    },
    header: {
        gap: 20,
    },
    heroImage: {
        width: '100%',
        height: 240,
        borderRadius: theme.radii.xl,
        overflow: 'hidden',
        backgroundColor: palette.surfaceAlt,
    },
    heroImageRadius: {
        borderRadius: theme.radii.xl,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(17, 24, 39, 0.28)',
    },
    heroContent: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
        gap: 12,
    },
    heroBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    heroBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: 'rgba(255, 90, 95, 0.95)',
    },
    heroBadgeText: {
        ...theme.typography.caption,
        color: palette.overlay,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    heroMeta: {
        ...theme.typography.caption,
        color: palette.overlay,
    },
    heroTitle: {
        ...theme.typography.title,
        color: palette.overlay,
    },
    heroSubTitle: {
        ...theme.typography.subtitle,
        color: palette.overlay,
    },
    heroFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heroAvatar: {
        width: 40,
        height: 40,
        borderRadius: theme.radii.pill,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroAvatarLabel: {
        ...theme.typography.caption,
        color: palette.overlay,
        fontWeight: '700',
    },
    heroFooterLabel: {
        ...theme.typography.body,
        color: palette.overlay,
        fontWeight: '600',
    },
    heroFooterMeta: {
        ...theme.typography.caption,
        color: palette.overlay,
    },
    heroFallback: {
        borderRadius: theme.radii.xl,
        backgroundColor: palette.surfaceAlt,
        padding: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: palette.border,
    },
    heroFallbackTitle: {
        ...theme.typography.title,
        color: palette.text,
    },
    heroFallbackSubtitle: {
        ...theme.typography.subtitle,
        color: palette.textMuted,
    },
    headerCard: {
        borderRadius: theme.radii.xl,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 24,
        gap: 24,
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 24,
        elevation: 6,
    },
    headerIntro: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    heading: { ...theme.typography.title, color: palette.text },
    subheading: { ...theme.typography.body, color: palette.textMuted, lineHeight: 24 },
    headerCountPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.highlight,
        borderWidth: 1,
        borderColor: palette.border,
    },
    headerCountLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    controlsCard: {
        gap: 20,
    },
    controlsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    controlsTitle: {
        ...theme.typography.label,
        color: palette.text,
    },
    controlsMeta: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
    categoryScroll: {
        gap: 12,
        paddingRight: 12,
    },
    categoryChip: {
        borderRadius: theme.radii.pill,
        backgroundColor: palette.surfaceAlt,
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: palette.border,
    },
    categoryChipActive: {
        backgroundColor: palette.primary,
        borderColor: palette.primary,
    },
    categoryChipPressed: {
        opacity: 0.85,
    },
    categoryChipLabel: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    categoryChipLabelActive: {
        color: palette.surface,
    },
    sortSection: {
        gap: 12,
    },
    sortTitle: { ...theme.typography.label, color: palette.textSubtle },
    sortRow: {
        flexDirection: 'row',
        gap: 12,
    },
    sortChip: {
        flex: 1,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surfaceAlt,
        flexDirection: 'row',
        gap: 8,
    },
    sortChipActive: {
        backgroundColor: palette.highlight,
        borderColor: palette.primary,
    },
    sortLabel: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    sortLabelActive: {
        color: palette.primary,
    },
    separator: { height: 24 },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
        gap: 18,
    },
    emptyBadge: {
        width: 60,
        height: 60,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.highlight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyBadgeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: palette.primary,
    },
    emptyTitle: { ...theme.typography.subtitle, color: palette.text },
    emptyDescription: { ...theme.typography.body, color: palette.textMuted, textAlign: 'center', lineHeight: 24 },
    emptyButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: palette.surface,
    },
    emptyButtonLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    footer: {
        marginTop: 24,
        padding: 24,
        borderRadius: theme.radii.xl,
        backgroundColor: palette.surfaceAlt,
        borderWidth: 1,
        borderColor: palette.border,
        gap: 10,
    },
    footerTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    footerBody: {
        ...theme.typography.body,
        color: palette.textMuted,
        lineHeight: 24,
    },
});

const PostCard = ({ post, onPress }: { post: StoragePost; onPress: () => void }) => {
    const images = post.images ?? [];
    const videos = post.videos ?? [];
    const cover = images[0] ?? post.storage.image;
    const hasVideo = videos.length > 0;
    const photoCount = images.length;
    const mediaLabel = hasVideo
        ? `${videos.length} video${videos.length > 1 ? 's' : ''}`
        : photoCount > 0
            ? `${photoCount} photo${photoCount > 1 ? 's' : ''}`
            : 'Host update';
    const tags = post.storage.tags ?? [];
    const categoryLabel = post.storage.category ?? 'Host update';

    return (
        <Pressable
            style={({ pressed }) => [cardStyles.container, pressed && cardStyles.containerPressed]}
            onPress={onPress}
        >
            {cover ? (
                <ImageBackground
                    source={{ uri: cover }}
                    style={cardStyles.image}
                    imageStyle={cardStyles.imageRadius}
                    resizeMode="cover"
                >
                    <View style={cardStyles.imageOverlay} />
                    <View style={cardStyles.badgeRow}>
                        <View style={cardStyles.badge}>
                            <Ionicons
                                name={hasVideo ? 'videocam-outline' : 'camera-outline'}
                                size={16}
                                color={palette.primary}
                            />
                            <Text style={cardStyles.badgeLabel}>{mediaLabel}</Text>
                        </View>
                    </View>
                </ImageBackground>
            ) : null}
            <View style={cardStyles.body}>
                <View style={cardStyles.metaRow}>
                    <Text style={cardStyles.category}>{categoryLabel}</Text>
                    <Text style={cardStyles.dot}>•</Text>
                    <Text style={cardStyles.date}>{formatDate(post.createdAt)}</Text>
                </View>
                <Text style={cardStyles.title}>{post.storage.title}</Text>
                <Text style={cardStyles.location}>{post.storage.location}</Text>
                <Text style={cardStyles.content} numberOfLines={3}>{post.content}</Text>
                <View style={cardStyles.statRow}>
                    <View style={cardStyles.statChip}>
                        <Ionicons name="cash-outline" size={16} color={palette.primary} />
                        <Text style={cardStyles.statValue}>{formatCurrency(post.storage.pricePerMonth)}/mo</Text>
                    </View>
                    <View style={cardStyles.statChip}>
                        <Ionicons name="star" size={16} color={palette.primary} />
                        <Text style={cardStyles.statValue}>{post.storage.rating.toFixed(1)} ({post.storage.reviews})</Text>
                    </View>
                    <View style={cardStyles.statChip}>
                        <Ionicons name="expand-outline" size={16} color={palette.textSubtle} />
                        <Text style={cardStyles.statValue}>{post.storage.sizeSqFt} sq ft</Text>
                    </View>
                </View>
                <Text style={cardStyles.access}>{post.storage.access}</Text>
                {tags.length ? (
                    <View style={cardStyles.tagRow}>
                        {tags.slice(0, 3).map((tag: string) => (
                            <View key={tag} style={cardStyles.tagChip}>
                                <Text style={cardStyles.tagLabel}>{tag}</Text>
                            </View>
                        ))}
                        {tags.length > 3 ? (
                            <View style={cardStyles.tagChipMuted}>
                                <Text style={cardStyles.tagLabelMuted}>+{tags.length - 3} more</Text>
                            </View>
                        ) : null}
                    </View>
                ) : null}
                <View style={cardStyles.userRow}>
                    <View style={cardStyles.avatar}>
                        <Text style={cardStyles.avatarLabel}>{getInitials(post.user.name)}</Text>
                    </View>
                    <View>
                        <Text style={cardStyles.userName}>{post.user.name}</Text>
                        <Text style={cardStyles.userHandle}>@{post.user.username}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

type PostCardStyles = {
    container: ViewStyle;
    containerPressed: ViewStyle;
    image: ImageStyle;
    imageRadius: ImageStyle;
    imageOverlay: ViewStyle;
    badgeRow: ViewStyle;
    badge: ViewStyle;
    badgeLabel: TextStyle;
    body: ViewStyle;
    metaRow: ViewStyle;
    category: TextStyle;
    dot: TextStyle;
    date: TextStyle;
    title: TextStyle;
    location: TextStyle;
    content: TextStyle;
    statRow: ViewStyle;
    statChip: ViewStyle;
    statValue: TextStyle;
    access: TextStyle;
    tagRow: ViewStyle;
    tagChip: ViewStyle;
    tagChipMuted: ViewStyle;
    tagLabel: TextStyle;
    tagLabelMuted: TextStyle;
    userRow: ViewStyle;
    avatar: ViewStyle;
    avatarLabel: TextStyle;
    userName: TextStyle;
    userHandle: TextStyle;
};

const cardStyles = StyleSheet.create<PostCardStyles>({
    container: {
        backgroundColor: palette.surface,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: palette.border,
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 4,
    },
    containerPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.96,
    },
    image: {
        width: '100%',
        height: 200,
        justifyContent: 'flex-start',
        backgroundColor: palette.surfaceAlt,
    },
    imageRadius: {
        borderTopLeftRadius: theme.radii.xl,
        borderTopRightRadius: theme.radii.xl,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(17, 24, 39, 0.25)',
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
    },
    badgeLabel: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    body: {
        padding: 20,
        gap: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    category: {
        ...theme.typography.caption,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        color: palette.primary,
        fontWeight: '600',
    },
    dot: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
    date: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
    title: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    location: {
        ...theme.typography.caption,
        color: palette.textSubtle,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    content: {
        ...theme.typography.body,
        color: palette.textMuted,
        lineHeight: 24,
    },
    statRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.surfaceAlt,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    statValue: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    access: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        borderRadius: theme.radii.pill,
        backgroundColor: palette.highlight,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    tagChipMuted: {
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: palette.surface,
    },
    tagLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    tagLabelMuted: {
        ...theme.typography.caption,
        color: palette.textSubtle,
        fontWeight: '600',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: palette.border,
    },
    avatarLabel: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '700',
    },
    userName: {
        ...theme.typography.body,
        color: palette.text,
        fontWeight: '600',
    },
    userHandle: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
});

export default PostsScreen;
