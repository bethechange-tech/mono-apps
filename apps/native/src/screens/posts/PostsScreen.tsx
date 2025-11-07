import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { palette, theme } from '@/theme';
import { storagePosts, type StoragePost } from '@/data/posts';

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

export function PostsScreen() {
    const categories = useMemo(
        () => ['All', ...Array.from(new Set(storagePosts.map((post) => post.storage.category)))],
        [],
    );
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const sortOptions: Array<{ label: 'Newest' | 'Oldest' | 'A-Z'; icon: keyof typeof Ionicons.glyphMap }> = useMemo(
        () => [
            { label: 'Newest', icon: 'sparkles-outline' },
            { label: 'Oldest', icon: 'time-outline' },
            { label: 'A-Z', icon: 'text-outline' },
        ],
        [],
    );
    const [sortOption, setSortOption] = useState<'Newest' | 'Oldest' | 'A-Z'>(sortOptions[0].label);

    const filteredPosts = useMemo(() => {
        const base = activeCategory === 'All'
            ? storagePosts
            : storagePosts.filter((post) => post.storage.category === activeCategory);

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
    }, [activeCategory, sortOption]);

    return (
        <Screen>
            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={(
                    <View style={styles.header}>
                        <Text style={styles.heading}>Storage Stories</Text>
                        <Text style={styles.subheading}>
                            Curated guidance from hosts who keep their renters delighted.
                        </Text>
                        <View style={styles.filterCard}>
                            <View style={styles.filterHeader}>
                                <Text style={styles.filterTitle}>Filter</Text>
                                <Text style={styles.filterMeta}>{activeCategory === 'All' ? 'Showing all topics' : activeCategory}</Text>
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
                                            onPress={() => setActiveCategory(category)}
                                            style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                                        >
                                            <Text
                                                style={[styles.categoryChipLabel, isActive && styles.categoryChipLabelActive]}
                                            >
                                                {category}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                            <View style={styles.sortSection}>
                                <Text style={styles.sortTitle}>Sort by</Text>
                                <View style={styles.sortRow}>
                                    {sortOptions.map(({ label, icon }) => {
                                        const isActive = label === sortOption;
                                        return (
                                            <Pressable
                                                key={label}
                                                onPress={() => setSortOption(label)}
                                                style={[styles.sortChip, isActive && styles.sortChipActive]}
                                            >
                                                <Ionicons
                                                    name={icon}
                                                    size={16}
                                                    color={isActive ? palette.primary : palette.textSubtle}
                                                />
                                                <Text
                                                    style={[styles.sortLabel, isActive && styles.sortLabelActive]}
                                                >
                                                    {label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>
                )}
                ListHeaderComponentStyle={styles.headerSpacing}
                renderItem={({ item }) => <PostCard post={item} />}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={(
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No stories just yet</Text>
                        <Text style={styles.emptyDescription}>
                            Try adjusting your filters to see more hosting tips.
                        </Text>
                    </View>
                )}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 16,
        paddingBottom: 32,
        backgroundColor: palette.background,
    },
    headerSpacing: {
        marginBottom: 16,
    },
    header: {
        gap: 14,
    },
    heading: { ...theme.typography.title, color: palette.text },
    subheading: { ...theme.typography.body, color: palette.textMuted, lineHeight: 22 },
    filterCard: {
        backgroundColor: palette.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 16,
        gap: 16,
    },
    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filterTitle: { ...theme.typography.subtitle, color: palette.text },
    filterMeta: { ...theme.typography.caption, color: palette.textSubtle },
    categoryScroll: {
        gap: 8,
        paddingRight: 8,
    },
    categoryChip: {
        borderRadius: theme.radii.pill,
        backgroundColor: palette.surfaceAlt,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: palette.border,
    },
    categoryChipActive: {
        backgroundColor: palette.primary,
        borderColor: palette.primary,
    },
    categoryChipLabel: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    categoryChipLabelActive: {
        color: palette.surface,
    },
    sortRow: {
        flexDirection: 'row',
        gap: 10,
    },
    sortChip: {
        flex: 1,
        borderRadius: theme.radii.sm,
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 10,
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
    sortSection: {
        gap: 12,
    },
    sortTitle: { ...theme.typography.label, color: palette.textSubtle },
    sortLabel: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    sortLabelActive: {
        color: palette.primary,
    },
    separator: { height: 16 },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        gap: 8,
    },
    emptyTitle: { ...theme.typography.subtitle, color: palette.text },
    emptyDescription: { ...theme.typography.caption, color: palette.textMuted, textAlign: 'center' },
});

const PostCard = ({ post }: { post: StoragePost }) => {
    const cover = post.images[0] ?? post.storage.image;
    const hasVideo = post.videos.length > 0;

    return (
        <Pressable style={cardStyles.container}>
            <Image source={{ uri: cover }} style={cardStyles.image} resizeMode="cover" />
            <View style={cardStyles.body}>
                <View style={cardStyles.metaRow}>
                    <View style={cardStyles.metaLeft}>
                        <Text style={cardStyles.category}>{post.storage.category}</Text>
                        <Text style={cardStyles.dot}>•</Text>
                        <Text style={cardStyles.date}>{formatDate(post.createdAt)}</Text>
                    </View>
                    {hasVideo ? (
                        <View style={cardStyles.badge}>
                            <Ionicons name="videocam-outline" size={14} color={palette.primary} />
                            <Text style={cardStyles.badgeLabel}>{post.videos.length} video</Text>
                        </View>
                    ) : null}
                </View>

                <View style={cardStyles.titleRow}>
                    <Text style={cardStyles.title}>{post.storage.title}</Text>
                </View>
                <Text style={cardStyles.location}>{post.storage.location}</Text>
                <Text style={cardStyles.content}>{post.content}</Text>

                <View style={cardStyles.statRow}>
                    <View style={cardStyles.statItem}>
                        <Ionicons name="cash-outline" size={16} color={palette.primary} />
                        <Text style={cardStyles.statValue}>{formatCurrency(post.storage.pricePerMonth)}/mo</Text>
                    </View>
                    <View style={cardStyles.statItem}>
                        <Ionicons name="star" size={16} color={palette.primary} />
                        <Text style={cardStyles.statValue}>{post.storage.rating.toFixed(1)} ({post.storage.reviews})</Text>
                    </View>
                    <View style={cardStyles.statItem}>
                        <Ionicons name="expand-outline" size={16} color={palette.textSubtle} />
                        <Text style={cardStyles.statValue}>{post.storage.sizeSqFt} sq ft</Text>
                    </View>
                </View>

                <Text style={cardStyles.access}>{post.storage.access}</Text>

                {post.storage.tags.length ? (
                    <View style={cardStyles.tagRow}>
                        {post.storage.tags.map((tag) => (
                            <View key={tag} style={cardStyles.tagChip}>
                                <Text style={cardStyles.tagLabel}>{tag}</Text>
                            </View>
                        ))}
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
    image: ImageStyle;
    body: ViewStyle;
    metaRow: ViewStyle;
    metaLeft: ViewStyle;
    category: TextStyle;
    dot: TextStyle;
    date: TextStyle;
    badge: ViewStyle;
    badgeLabel: TextStyle;
    titleRow: ViewStyle;
    title: TextStyle;
    location: TextStyle;
    content: TextStyle;
    statRow: ViewStyle;
    statItem: ViewStyle;
    statValue: TextStyle;
    access: TextStyle;
    tagRow: ViewStyle;
    tagChip: ViewStyle;
    tagLabel: TextStyle;
    userRow: ViewStyle;
    avatar: ViewStyle;
    avatarLabel: TextStyle;
    userName: TextStyle;
    userHandle: TextStyle;
};

const cardStyles = StyleSheet.create<PostCardStyles>({
    container: {
        backgroundColor: palette.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: palette.border,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: palette.surfaceAlt,
    },
    body: {
        padding: 18,
        gap: 14,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaLeft: {
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
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: palette.highlight,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
    },
    badgeLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    titleRow: {
        gap: 6,
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
        lineHeight: 22,
    },
    statRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
        backgroundColor: palette.surfaceAlt,
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    tagLabel: {
        ...theme.typography.caption,
        color: palette.textSubtle,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
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
