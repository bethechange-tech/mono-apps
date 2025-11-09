import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';
import { ActionIconButton } from './ActionIconButton';

type HeroStat = {
    id: string;
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export function HeroSection() {
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const stats = useMemo<HeroStat[]>(
        () => [
            { id: 'nearby', label: 'spaces nearby', value: '18', icon: 'navigate-outline' },
            { id: 'saved', label: 'saved searches', value: '4', icon: 'bookmark-outline' },
        ],
        []
    );

    return (
        <LinearGradient colors={[palette.primaryAlt, palette.primary]} style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.userRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>DW</Text>
                    </View>
                    <View style={styles.greetingCopy}>
                        <Text style={styles.greetingLabel}>{greeting}, David</Text>
                        <Text style={styles.greetingHeadline}>Need a little extra room today?</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    <ActionIconButton name="notifications-outline" />
                    <ActionIconButton name="chatbubble-ellipses-outline" />
                </View>
            </View>

            <View style={styles.locationRow}>
                <View style={styles.locationPill}>
                    <Ionicons name="location-outline" size={16} color="#FFFFFFE6" />
                    <Text style={styles.locationText}>Brooklyn, New York</Text>
                </View>
                <View style={styles.metaPill}>
                    <Ionicons name="calendar-outline" size={16} color="#FFFFFFE6" />
                    <Text style={styles.metaPillText}>Flexible dates</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                {stats.map((item) => (
                    <View key={item.id} style={styles.statCard}>
                        <View style={styles.statIconWrap}>
                            <Ionicons name={item.icon} size={18} color={palette.primary} />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{item.value}</Text>
                            <Text style={styles.statLabel}>{item.label}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <Pressable style={styles.ctaButton}>
                <View style={styles.ctaContent}>
                    <View style={styles.ctaIcon}>
                        <Ionicons name="map-outline" size={18} color={palette.primary} />
                    </View>
                    <View style={styles.ctaCopy}>
                        <Text style={styles.ctaTitle}>Explore on the map</Text>
                        <Text style={styles.ctaSubtitle}>Spot available hosts around you</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
            </Pressable>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 44,
        borderBottomLeftRadius: theme.radii.xl,
        borderBottomRightRadius: theme.radii.xl,
        gap: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF26',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 18,
    },
    greetingCopy: {
        flexShrink: 1,
        gap: 4,
    },
    greetingLabel: {
        ...theme.typography.caption,
        color: '#FFFFFFCC',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    greetingHeadline: {
        ...theme.typography.title,
        color: '#FFFFFF',
        lineHeight: 26,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    locationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        backgroundColor: '#FFFFFF1A',
    },
    locationText: {
        ...theme.typography.label,
        color: '#FFFFFFE6',
    },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        backgroundColor: '#FFFFFF12',
    },
    metaPillText: {
        ...theme.typography.caption,
        color: '#FFFFFFCC',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexBasis: '48%',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: theme.radii.lg,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },
    statIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        ...theme.typography.subtitle,
        color: palette.primary,
        fontWeight: '700',
    },
    statLabel: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    ctaButton: {
        borderRadius: theme.radii.lg,
        backgroundColor: '#1E293B33',
        padding: 16,
    },
    ctaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    ctaIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaCopy: {
        flex: 1,
        gap: 4,
    },
    ctaTitle: {
        ...theme.typography.subtitle,
        color: '#FFFFFF',
    },
    ctaSubtitle: {
        ...theme.typography.caption,
        color: '#FFFFFFCC',
    },
});
