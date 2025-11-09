import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';

type StoryContentProps = {
    paragraphs: string[];
    quote: string;
    monthlyPrice: string;
    rating: number;
    reviews: number;
    sizeSqFt: number;
    access: string;
    gallery: string[];
    videos: string[];
    tags: string[];
    onViewListing(): void;
    onViewPosts(): void;
};

export function StoryContent({
    paragraphs,
    quote,
    monthlyPrice,
    rating,
    reviews,
    sizeSqFt,
    access,
    gallery,
    videos,
    tags,
    onViewListing,
    onViewPosts,
}: StoryContentProps) {
    return (
        <View style={styles.container}>
            {paragraphs.map((paragraph, index) => (
                <Text key={`paragraph-${index}`} style={styles.paragraph}>
                    {paragraph}
                </Text>
            ))}

            <View style={styles.quoteBlock}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={palette.primary} />
                <Text style={styles.quoteText}>“{quote}”</Text>
            </View>

            <View style={styles.specCard}>
                <Text style={styles.specTitle}>Space snapshot</Text>
                <View style={styles.specRow}>
                    <Ionicons name="cash-outline" size={18} color={palette.primary} />
                    <Text style={styles.specLabel}>{monthlyPrice} per month</Text>
                </View>
                <View style={styles.specRow}>
                    <Ionicons name="star" size={18} color={palette.primary} />
                    <Text style={styles.specLabel}>{rating.toFixed(1)} rating · {reviews} reviews</Text>
                </View>
                <View style={styles.specRow}>
                    <Ionicons name="expand-outline" size={18} color={palette.primary} />
                    <Text style={styles.specLabel}>{sizeSqFt} sq ft</Text>
                </View>
                <View style={styles.specRow}>
                    <Ionicons name="lock-closed-outline" size={18} color={palette.primary} />
                    <Text style={styles.specLabel}>{access}</Text>
                </View>
            </View>

            {gallery.length ? (
                <View style={styles.gallery}>
                    <Text style={styles.galleryTitle}>Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                        {gallery.map((uri) => (
                            <Image key={uri} source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
                        ))}
                    </ScrollView>
                </View>
            ) : null}

            {videos.length ? (
                <View style={styles.videoCallout}>
                    <Ionicons name="play-circle" size={32} color={palette.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.videoTitle}>Watch the walkthrough</Text>
                        <Text style={styles.videoSubtitle}>
                            This post includes {videos.length} hosted video{videos.length > 1 ? 's' : ''}. Open on web to stream.
                        </Text>
                    </View>
                </View>
            ) : null}

            {tags.length ? (
                <View style={styles.tagCloud}>
                    {tags.map((tag) => (
                        <View key={tag} style={styles.tagPill}>
                            <Text style={styles.tagLabel}>{tag}</Text>
                        </View>
                    ))}
                </View>
            ) : null}

            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={onViewListing}>
                <Text style={styles.primaryButtonLabel}>See availability</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]} onPress={onViewPosts}>
                <Text style={styles.secondaryButtonLabel}>More host stories</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 24,
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
        padding: 18,
        gap: 12,
    },
    specTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontWeight: '600',
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
        fontWeight: '600',
    },
    galleryScroll: {
        flexDirection: 'row',
        gap: 12,
    },
    galleryImage: {
        width: 180,
        height: 140,
        borderRadius: theme.radii.md,
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
});
