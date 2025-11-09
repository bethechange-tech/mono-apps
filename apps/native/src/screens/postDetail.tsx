import { useCallback, useEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '@/components/Screen';
import { palette, theme } from '@/theme';
import type { StoragePost } from '@/data/posts';
import { postRepository } from '@/features/posts/domain/postRepository';
import { formatCurrency } from '@/utils/currency';
import { HeroSection } from './postDetail/components/HeroSection';
import { AuthorSection } from './postDetail/components/AuthorSection';
import { InlineErrorCallout } from './postDetail/components/InlineErrorCallout';
import { StoryContent } from './postDetail/components/StoryContent';

const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

type RootStackParamList = {
    Root: undefined;
    ListingDetail: { id: string };
    PostDetail: { id: string };
    ListingPosts: { id: string };
};

type PostDetailRoute = RouteProp<RootStackParamList, 'PostDetail'>;

type AuthorMeta = {
    readingMinutes: number;
    wordCount: number;
};

const getAuthorMeta = (content: string): AuthorMeta => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));
    return { wordCount, readingMinutes };
};

const buildArticleParagraphs = (
    content: string,
    storageTags: readonly string[] | undefined,
    storageAccess: string | undefined,
): string[] => {
    const tags = storageTags ?? [];
    const baseParagraph = content.trim();
    const amenityParagraph = tags.length
        ? `Amenities include ${tags.join(', ')} — ideal for renters looking for thoughtful touches.`
        : '';
    const accessParagraph = storageAccess
        ? `Access details: ${storageAccess}. Hosts keep this running smoothly for both weekday and weekend pick ups.`
        : '';
    return [baseParagraph, amenityParagraph, accessParagraph].filter(Boolean);
};

export default function PostDetailScreen() {
    const route = useRoute<PostDetailRoute>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { id } = route.params;
    const [post, setPost] = useState<StoragePost | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPost = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await postRepository.get(id);
            if (response) {
                setPost(response);
            } else {
                setPost(null);
                setError('This story is no longer available.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load story.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadPost();
    }, [loadPost]);

    const authorMeta = useMemo(() => {
        if (!post) {
            return { readingMinutes: 0, wordCount: 0 } satisfies AuthorMeta;
        }
        return getAuthorMeta(post.content);
    }, [post]);

    const paragraphs = useMemo(() => {
        if (!post) {
            return [] as string[];
        }
        return buildArticleParagraphs(post.content, post.storage.tags, post.storage.access);
    }, [post]);

    const authorInitials = useMemo(() => {
        if (!post) {
            return '?';
        }
        return (
            post.user.name
                .trim()
                .split(/\s+/)
                .filter((segment) => segment.length)
                .map((segment) => segment[0]?.toUpperCase() ?? '')
                .join('') || '?'
        );
    }, [post]);

    if (loading && !post) {
        return (
            <Screen>
                <View style={styles.statusContainer}>
                    <ActivityIndicator color={palette.primary} />
                    <Text style={styles.statusLabel}>Loading story…</Text>
                </View>
            </Screen>
        );
    }

    if (!post) {
        return (
            <Screen>
                <View style={styles.missing}>
                    <Text style={styles.missingTitle}>Story unavailable</Text>
                    <Text style={styles.missingBody}>
                        {error ?? 'This host update could not be found. Try returning to the stories feed.'}
                    </Text>
                    <View style={styles.missingActions}>
                        <Pressable
                            style={({ pressed }) => [styles.primaryButton, styles.missingPrimaryButton, pressed && styles.primaryButtonPressed]}
                            onPress={() => void loadPost()}
                        >
                            <Text style={styles.primaryButtonLabel}>Retry</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.secondaryButton, styles.missingSecondaryButton, pressed && styles.secondaryButtonPressed]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.secondaryButtonLabel}>Go back</Text>
                        </Pressable>
                    </View>
                </View>
            </Screen>
        );
    }

    const { readingMinutes, wordCount } = authorMeta;
    const heroImage = post.images?.[0] ?? post.storage.image;
    const gallery = post.images?.slice(1) ?? [];
    const monthlyPrice = formatCurrency(post.storage.pricePerMonth);
    const postVideos = post.videos ?? [];
    const storageTags = post.storage.tags ?? [];
    const storageCategory = post.storage.category ?? 'Storage';
    const createdAtLabel = formatDate(post.createdAt);

    return (
        <Screen padded={false}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <HeroSection
                    imageUri={heroImage}
                    category={storageCategory}
                    createdAtLabel={createdAtLabel}
                    readingMinutes={readingMinutes}
                    title={post.storage.title}
                    location={post.storage.location}
                    rating={post.storage.rating}
                    reviews={post.storage.reviews}
                />

                <View style={styles.article}>
                    <AuthorSection
                        initials={authorInitials}
                        name={post.user.name}
                        username={post.user.username}
                        wordCount={wordCount}
                        onViewListing={() => navigation.navigate('ListingDetail', { id: post.storage.id })}
                        onViewPosts={() => navigation.navigate('ListingPosts', { id: post.storage.id })}
                    />

                    {error ? <InlineErrorCallout message={error} onRetry={() => void loadPost()} /> : null}

                    <StoryContent
                        paragraphs={paragraphs}
                        quote={post.content}
                        monthlyPrice={monthlyPrice}
                        rating={post.storage.rating}
                        reviews={post.storage.reviews}
                        sizeSqFt={post.storage.sizeSqFt}
                        access={post.storage.access}
                        gallery={gallery}
                        videos={postVideos}
                        tags={storageTags}
                        onViewListing={() => navigation.navigate('ListingDetail', { id: post.storage.id })}
                        onViewPosts={() => navigation.navigate('ListingPosts', { id: post.storage.id })}
                    />
                </View>
            </ScrollView>
        </Screen>
    );
}

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
    scroll: {
        paddingBottom: 48,
        backgroundColor: palette.background,
    },
    article: {
        padding: 24,
        gap: 24,
    },
    missing: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 24,
    },
    missingTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    missingBody: {
        ...theme.typography.body,
        color: palette.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    missingActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        flexWrap: 'wrap',
        width: '100%',
    },
    primaryButton: {
        marginTop: 12,
        paddingVertical: 14,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonPressed: {
        opacity: 0.92,
    },
    primaryButtonLabel: {
        ...theme.typography.label,
        color: palette.surface,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    secondaryButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: palette.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonPressed: {
        opacity: 0.9,
    },
    secondaryButtonLabel: {
        ...theme.typography.label,
        color: palette.primary,
    },
    missingPrimaryButton: {
        marginTop: 0,
        minWidth: 140,
    },
    missingSecondaryButton: {
        marginTop: 0,
    },
});
