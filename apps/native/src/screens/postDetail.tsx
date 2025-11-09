import { useMemo } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/Screen';
import { palette, theme } from '@/theme';
import { storagePosts } from '@/data/posts';
import { formatCurrency } from '@/utils/currency';

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

const buildArticleParagraphs = (content: string, storageTags: readonly string[] | undefined, storageAccess: string): string[] => {
    const tags = storageTags ?? [];
    const baseParagraph = content.trim();
    const amenityParagraph = tags.length
        ? `Amenities include ${tags.join(', ')} — ideal for renters looking for thoughtful touches.`
        : '';
    const accessParagraph = `Access details: ${storageAccess}. Hosts keep this running smoothly for both weekday and weekend pick ups.`;
    return [baseParagraph, amenityParagraph, accessParagraph].filter(Boolean);
};

type ActionButtonProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
};

const ActionButton = ({ icon, label, onPress }: ActionButtonProps) => (
    <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]} onPress={onPress}>
        <Ionicons name={icon} size={16} color={palette.primary} />
        <Text style={styles.actionButtonLabel}>{label}</Text>
    </Pressable>
);

export default function PostDetailScreen() {
    const route = useRoute<PostDetailRoute>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { id } = route.params;

    const post = useMemo(() => storagePosts.find((entry) => entry.id === id), [id]);

    if (!post) {
        return (
            <Screen>
                <View style={styles.missing}>
                    <Text style={styles.missingTitle}>Story unavailable</Text>
                    <Text style={styles.missingBody}>This host update could not be found. Try returning to the stories feed.</Text>
                    <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.secondaryButtonLabel}>Go back</Text>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    const heroImage = post.images?.[0] ?? post.storage.image;
    const gallery = post.images?.slice(1) ?? [];
    const { readingMinutes, wordCount } = useMemo(() => getAuthorMeta(post.content), [post.content]);
    const paragraphs = useMemo(
        () => buildArticleParagraphs(post.content, post.storage.tags, post.storage.access),
        [post.content, post.storage.tags, post.storage.access],
    );
    const monthlyPrice = formatCurrency(post.storage.pricePerMonth);
    const postVideos = post.videos ?? [];
    const storageTags = post.storage.tags ?? [];
    const storageCategory = post.storage.category ?? 'Storage';

    return (
        <Screen padded={false}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {heroImage ? (
                    <ImageBackground source={{ uri: heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
                        <View style={styles.heroOverlay} />
                        <View style={styles.heroContent}>
                            <View style={styles.heroBadgeRow}>
                                <View style={styles.heroBadge}>
                                    <Text style={styles.heroBadgeText}>{storageCategory}</Text>
                                </View>
                                <Text style={styles.heroBadgeMeta}>{formatDate(post.createdAt)}</Text>
                                <View style={styles.heroDot} />
                                <Text style={styles.heroBadgeMeta}>{readingMinutes}-min read</Text>
                            </View>
                            <Text style={styles.heroTitle}>{post.storage.title}</Text>
                            <View style={styles.heroLocationRow}>
                                <Ionicons name="location-outline" size={16} color={palette.overlay} />
                                <Text style={styles.heroLocation}>{post.storage.location}</Text>
                            </View>
                            <View style={styles.heroStatsRow}>
                                <View style={styles.heroStat}>
                                    <Ionicons name="star" size={16} color={palette.overlay} />
                                    <Text style={styles.heroStatText}>{post.storage.rating.toFixed(1)} rating</Text>
                                </View>
                                <View style={styles.heroDot} />
                                <View style={styles.heroStat}>
                                    <Ionicons name="people-outline" size={16} color={palette.overlay} />
                                    <Text style={styles.heroStatText}>{post.storage.reviews} reviews</Text>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                ) : null}

                <View style={styles.article}>
                    <View style={styles.authorSection}>
                        <View style={styles.authorHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarLabel}>{post.user.name.split(' ').map((part) => part[0]?.toUpperCase()).join('')}</Text>
                            </View>
                            <View style={styles.authorMeta}>
                                <Text style={styles.authorName}>{post.user.name}</Text>
                                <Text style={styles.authorHandle}>@{post.user.username} · {wordCount} words</Text>
                            </View>
                        </View>
                        <View style={styles.authorActions}>
                            <ActionButton
                                icon="home-outline"
                                label="View listing"
                                onPress={() => navigation.navigate('ListingDetail', { id: post.storage.id })}
                            />
                            <ActionButton
                                icon="book-outline"
                                label="Host stories"
                                onPress={() => navigation.navigate('ListingPosts', { id: post.storage.id })}
                            />
                        </View>
                    </View>

                    {paragraphs.map((paragraph, index) => (
                        <Text key={index.toString()} style={styles.paragraph}>
                            {paragraph}
                        </Text>
                    ))}

                    <View style={styles.quoteBlock}>
                        <Ionicons name="chatbubble-ellipses-outline" size={18} color={palette.primary} />
                        <Text style={styles.quoteText}>
                            “{post.content}”
                        </Text>
                    </View>

                    <View style={styles.specCard}>
                        <Text style={styles.specTitle}>Space snapshot</Text>
                        <View style={styles.specRow}>
                            <Ionicons name="cash-outline" size={18} color={palette.primary} />
                            <Text style={styles.specLabel}>{monthlyPrice} per month</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Ionicons name="star" size={18} color={palette.primary} />
                            <Text style={styles.specLabel}>{post.storage.rating.toFixed(1)} rating · {post.storage.reviews} reviews</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Ionicons name="expand-outline" size={18} color={palette.primary} />
                            <Text style={styles.specLabel}>{post.storage.sizeSqFt} sq ft</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Ionicons name="lock-closed-outline" size={18} color={palette.primary} />
                            <Text style={styles.specLabel}>{post.storage.access}</Text>
                        </View>
                    </View>

                    {gallery.length ? (
                        <View style={styles.gallery}>
                            <Text style={styles.galleryTitle}>Gallery</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                                {gallery.map((imageUri) => (
                                    <Image key={imageUri} source={{ uri: imageUri }} style={styles.galleryImage} resizeMode="cover" />
                                ))}
                            </ScrollView>
                        </View>
                    ) : null}

                    {postVideos.length ? (
                        <View style={styles.videoCallout}>
                            <Ionicons name="play-circle" size={32} color={palette.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.videoTitle}>Watch the walkthrough</Text>
                                <Text style={styles.videoSubtitle}>This post includes {postVideos.length} hosted video{postVideos.length > 1 ? 's' : ''}. Open on web to stream.</Text>
                            </View>
                        </View>
                    ) : null}

                    {storageTags.length ? (
                        <View style={styles.tagCloud}>
                            {storageTags.map((tag) => (
                                <View key={tag} style={styles.tagPill}>
                                    <Text style={styles.tagLabel}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    ) : null}

                    <Pressable
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                        onPress={() => navigation.navigate('ListingDetail', { id: post.storage.id })}
                    >
                        <Text style={styles.primaryButtonLabel}>See availability</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
                        onPress={() => navigation.navigate('ListingPosts', { id: post.storage.id })}
                    >
                        <Text style={styles.secondaryButtonLabel}>More host stories</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingBottom: 48,
        backgroundColor: palette.background,
    },
    hero: {
        height: 320,
        justifyContent: 'flex-end',
    },
    heroImage: {
        borderBottomLeftRadius: theme.radii.xl,
        borderBottomRightRadius: theme.radii.xl,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(17, 24, 39, 0.32)',
    },
    heroContent: {
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
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroBadgeText: {
        ...theme.typography.caption,
        color: palette.overlay,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    heroBadgeMeta: {
        ...theme.typography.caption,
        color: palette.overlay,
    },
    heroTitle: {
        ...theme.typography.title,
        color: palette.overlay,
    },
    heroLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    heroLocation: {
        ...theme.typography.body,
        color: palette.overlay,
    },
    heroStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    heroStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    heroStatText: {
        ...theme.typography.caption,
        color: palette.overlay,
    },
    heroDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: palette.overlay,
        opacity: 0.75,
    },
    article: {
        padding: 24,
        gap: 24,
    },
    authorSection: {
        gap: 16,
    },
    authorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: theme.radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
    },
    avatarLabel: {
        ...theme.typography.subtitle,
        color: palette.primary,
        fontWeight: '700',
    },
    authorMeta: {
        flex: 1,
        gap: 4,
    },
    authorName: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontWeight: '600',
    },
    authorHandle: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    authorActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: palette.surface,
    },
    actionButtonPressed: {
        opacity: 0.85,
    },
    actionButtonLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    paragraph: {
        ...theme.typography.body,
        color: palette.textMuted,
        lineHeight: 26,
    },
    quoteBlock: {
        borderLeftWidth: 3,
        borderLeftColor: palette.primary,
        backgroundColor: palette.surface,
        padding: 16,
        gap: 8,
        borderRadius: theme.radii.lg,
    },
    quoteText: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontStyle: 'italic',
    },
    specCard: {
        backgroundColor: palette.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 20,
        gap: 12,
    },
    specTitle: {
        ...theme.typography.label,
        color: palette.text,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    specRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    specLabel: {
        ...theme.typography.body,
        color: palette.text,
    },
    gallery: {
        gap: 12,
    },
    galleryTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    galleryScroll: {
        gap: 12,
    },
    galleryImage: {
        width: 220,
        height: 160,
        borderRadius: theme.radii.lg,
        backgroundColor: palette.surfaceAlt,
    },
    videoCallout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: palette.surfaceAlt,
        borderRadius: theme.radii.lg,
        padding: 18,
        borderWidth: 1,
        borderColor: palette.border,
    },
    videoTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontWeight: '600',
    },
    videoSubtitle: {
        ...theme.typography.caption,
        color: palette.textMuted,
        lineHeight: 20,
    },
    tagCloud: {
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
});
