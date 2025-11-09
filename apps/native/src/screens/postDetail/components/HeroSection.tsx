import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';

export type HeroSectionProps = {
    imageUri?: string;
    category: string;
    createdAtLabel: string;
    readingMinutes: number;
    title: string;
    location: string;
    rating: number;
    reviews: number;
};

export function HeroSection({
    imageUri,
    category,
    createdAtLabel,
    readingMinutes,
    title,
    location,
    rating,
    reviews,
}: HeroSectionProps) {
    if (!imageUri) {
        return null;
    }

    return (
        <ImageBackground source={{ uri: imageUri }} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
                <View style={styles.heroBadgeRow}>
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>{category}</Text>
                    </View>
                    <Text style={styles.heroBadgeMeta}>{createdAtLabel}</Text>
                    <View style={styles.heroDot} />
                    <Text style={styles.heroBadgeMeta}>{readingMinutes}-min read</Text>
                </View>
                <Text style={styles.heroTitle}>{title}</Text>
                <View style={styles.heroLocationRow}>
                    <Ionicons name="location-outline" size={16} color={palette.overlay} />
                    <Text style={styles.heroLocation}>{location}</Text>
                </View>
                <View style={styles.heroStatsRow}>
                    <View style={styles.heroStat}>
                        <Ionicons name="star" size={16} color={palette.overlay} />
                        <Text style={styles.heroStatText}>{rating.toFixed(1)} rating</Text>
                    </View>
                    <View style={styles.heroDot} />
                    <View style={styles.heroStat}>
                        <Ionicons name="people-outline" size={16} color={palette.overlay} />
                        <Text style={styles.heroStatText}>{reviews} reviews</Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: 320,
        justifyContent: 'flex-end',
        backgroundColor: palette.surfaceAlt,
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
});
