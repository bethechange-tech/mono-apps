import React, { useCallback, useMemo } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, theme } from '@/theme';
import type { Listing, ListingPost } from '@/data/listings';
import Screen from '@/components/Screen';
import { createListingSelector, useListingStore } from '@/store/listingStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (!parts.length) return '?';
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
};

type StackParamList = {
    ListingPosts: { id: string };
    PostDetail: { id: string };
    ListingDetail: { id: string };
    Root: undefined;
};

type ListingPostsRoute = RouteProp<StackParamList, 'ListingPosts'>;

type StackNavigation = NativeStackNavigationProp<StackParamList>;

const PostCard = ({ post, onPress }: { post: ListingPost; onPress: () => void }) => {
    const cover = post.images?.[0];
    return (
        <Pressable
            style={({ pressed }) => [styles.postCard, pressed && styles.postCardPressed]}
            onPress={onPress}
        >
            {cover ? (
                <ImageBackground
                    source={{ uri: cover }}
                    style={styles.postImage}
                    imageStyle={styles.postImageRadius}
                >
                    <View style={styles.postImageOverlay} />
                    <View style={styles.postBadge}>
                        <Text style={styles.postBadgeText}>Host update</Text>
                    </View>
                </ImageBackground>
            ) : null}
            <View style={styles.postBody}>
                <View style={styles.postHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarLabel}>{getInitials(post.user.name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.postUser}>{post.user.name}</Text>
                        <Text style={styles.postHandle}>@{post.user.username}</Text>
                    </View>
                    <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                </View>
                <Text style={styles.postContent} numberOfLines={5}>{post.content}</Text>
            </View>
        </Pressable>
    );
};

export default function ListingPostsScreen() {
    const route = useRoute<ListingPostsRoute>();
    const { id } = route.params;
    const navigation = useNavigation<StackNavigation>();
    const fetchListing = useListingStore((state) => state.fetchListing);
    const selector = useMemo(() => createListingSelector(id), [id]);
    const entry = useListingStore(selector);

    const ensureListing = useCallback(() => {
        if (entry.status === 'idle') {
            void fetchListing(id);
        }
    }, [entry.status, fetchListing, id]);

    React.useEffect(() => {
        ensureListing();
    }, [ensureListing]);

    if (entry.status === 'idle' || entry.status === 'loading') {
        return <Screen><Text style={styles.loading}>Loading posts…</Text></Screen>;
    }

    if (entry.status === 'error' || !entry.data) {
        return <Screen><Text style={styles.loading}>Listing not found.</Text></Screen>;
    }

    const listing = entry.data;

    const posts = useMemo(() => {
        const next = listing.posts ?? [];
        return [...next].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [listing.posts]);

    const handleOpenPost = useCallback((postId: string) => {
        navigation.navigate('PostDetail', { id: postId });
    }, [navigation]);

    return (
        <Screen padded={false}>
            <FlatList
                data={posts}
                keyExtractor={(post) => post.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={(<Header listing={listing} count={posts.length} latestPostAt={posts[0]?.createdAt} />)}
                ListEmptyComponent={(<EmptyState />)}
                renderItem={({ item: post }) => (
                    <PostCard
                        post={post}
                        onPress={() => handleOpenPost(post.id)}
                    />
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={posts.length ? <Footer /> : null}
            />
        </Screen>
    );
}

const Header = ({ listing, count, latestPostAt }: { listing: Listing; count: number; latestPostAt?: string }) => {
    const tags = listing.tags ?? [];

    return (
        <View style={styles.header}>
            <ImageBackground
                source={{ uri: listing.image }}
                style={styles.heroImage}
                imageStyle={styles.heroImageRadius}
            >
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                    <View style={styles.heroBadgeRow}>
                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeText}>Host stories</Text>
                        </View>
                        {latestPostAt ? (
                            <Text style={styles.heroSub}>Updated {formatDate(latestPostAt)}</Text>
                        ) : null}
                    </View>
                    <Text style={styles.heroTitle}>{listing.title}</Text>
                    <Text style={styles.heroLocation}>{listing.location}</Text>
                    <View style={styles.heroMetaRow}>
                        <Text style={styles.heroMeta}>⭐ {listing.rating.toFixed(1)} · {listing.reviews} reviews</Text>
                        <View style={styles.heroDot} />
                        <Text style={styles.heroMeta}>{count} host {count === 1 ? 'story' : 'stories'}</Text>
                    </View>
                </View>
            </ImageBackground>
            <View style={styles.headerCard}>
                <Text style={styles.headerDescription}>
                    Stories and updates from the host to help you understand how this space works in everyday use.
                </Text>
                {tags.length ? (
                    <View style={styles.tagRow}>
                        {tags.slice(0, 3).map((tag: string) => (
                            <View key={tag} style={styles.tagPill}>
                                <Text style={styles.tagLabel}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>
        </View>
    );
};

const EmptyState = () => (
    <View style={styles.emptyState}>
        <View style={styles.emptyBadge}>
            <View style={styles.emptyBadgeDot} />
        </View>
        <Text style={styles.emptyTitle}>No stories yet</Text>
        <Text style={styles.emptySub}>This host hasn’t shared any updates for this listing.</Text>
    </View>
);

const Footer = () => (
    <View style={styles.footer}>
        <Text style={styles.footerTitle}>Looking for more?</Text>
        <Text style={styles.footerBody}>
            Check back soon for fresh build-outs, maintenance notes, and host tips to make the most of this space.
        </Text>
    </View>
);

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 16,
        paddingBottom: 48,
        paddingTop: 24,
        gap: 20,
        backgroundColor: palette.background,
    },
    separator: { height: 20 },
    loading: { ...theme.typography.body, padding: 20 },
    header: {
        gap: 16,
    },
    heroImage: {
        width: '100%',
        height: 220,
        borderRadius: theme.radii.xl,
        overflow: 'hidden',
        backgroundColor: palette.surfaceAlt,
        position: 'relative',
    },
    heroImageRadius: {
        borderRadius: theme.radii.xl,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(17, 24, 39, 0.25)',
    },
    heroContent: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
        gap: 10,
    },
    heroBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heroBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: 'rgba(255, 90, 95, 0.9)',
    },
    heroBadgeText: {
        ...theme.typography.caption,
        color: palette.overlay,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    heroSub: {
        ...theme.typography.caption,
        color: palette.overlay,
    },
    heroTitle: {
        ...theme.typography.title,
        color: palette.overlay,
    },
    heroLocation: {
        ...theme.typography.subtitle,
        color: palette.overlay,
    },
    heroMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    heroMeta: {
        ...theme.typography.caption,
        color: palette.overlay,
    },
    heroDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: palette.overlay,
        opacity: 0.8,
    },
    headerCard: {
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        padding: 20,
        gap: 16,
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 24,
        elevation: 6,
    },
    headerDescription: {
        ...theme.typography.body,
        color: palette.textMuted,
        lineHeight: 22,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.highlight,
    },
    tagLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    postCard: {
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 4,
    },
    postCardPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.95,
    },
    postImage: {
        width: '100%',
        height: 160,
        backgroundColor: palette.surfaceAlt,
        justifyContent: 'flex-end',
    },
    postImageRadius: {
        borderTopLeftRadius: theme.radii.lg,
        borderTopRightRadius: theme.radii.lg,
    },
    postImageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(17, 24, 39, 0.25)',
    },
    postBadge: {
        alignSelf: 'flex-start',
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        backgroundColor: 'rgba(255, 90, 95, 0.95)',
    },
    postBadgeText: {
        ...theme.typography.caption,
        color: palette.overlay,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    postBody: { padding: 18, gap: 12 },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
    avatarLabel: { ...theme.typography.caption, fontWeight: '700', color: palette.text },
    postUser: { ...theme.typography.body, fontWeight: '600', color: palette.text },
    postHandle: { ...theme.typography.caption, color: palette.textSubtle },
    postDate: { ...theme.typography.caption, color: palette.textSubtle },
    postContent: { ...theme.typography.body, color: palette.textMuted, lineHeight: 24 },
    emptyState: {
        paddingVertical: 72,
        alignItems: 'center',
        gap: 16,
    },
    emptyBadge: {
        width: 56,
        height: 56,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.highlight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyBadgeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: palette.primary,
    },
    emptyTitle: { ...theme.typography.subtitle, color: palette.text },
    emptySub: { ...theme.typography.body, color: palette.textMuted, textAlign: 'center', lineHeight: 24 },
    footer: {
        marginTop: 12,
        padding: 20,
        borderRadius: theme.radii.lg,
        backgroundColor: palette.surfaceAlt,
        borderWidth: 1,
        borderColor: palette.border,
        gap: 8,
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
