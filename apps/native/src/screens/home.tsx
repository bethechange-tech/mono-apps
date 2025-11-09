import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Text, useWindowDimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import type { ListingSummary } from '@/data/listings';
import { useHomeFilters, useHomeMap, useHomePricing } from '@/store/homeStore';
import { HeroSection } from './home/HeroSection';
import { SearchCard } from './home/SearchCard';
import { TotalPriceToggle } from './home/TotalPriceToggle';
import { PopularSection } from './home/PopularSection';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';
import { listingRepository } from '@/features/explore/domain/listingRepository';

const Home = () => {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const { category, setCategory } = useHomeFilters();
    const { showTotal, setShowTotal } = useHomePricing();
    const { showMap, toggleMap } = useHomeMap();
    const [listings, setListings] = useState<ListingSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadListings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await listingRepository.list();
            setListings(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load storages');
            setListings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadListings();
    }, [loadListings]);

    const filteredListings = useMemo(() => {
        if (category === 'all') return listings;
        return listings.filter((item) => item.category?.toLowerCase() === category);
    }, [category, listings]);

    return (
        <Screen padded={false}>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <HeroSection />
                    <View style={[styles.sectionWrapper, isTablet && styles.sectionWrapperTablet]}>
                        <SearchCard selectedCategory={category} onSelectCategory={setCategory} />
                    </View>

                    <View style={[styles.body, isTablet && styles.bodyTablet]}>
                        <TotalPriceToggle value={showTotal} onChange={setShowTotal} />
                        {loading ? (
                            <View style={styles.statusContainer}>
                                <ActivityIndicator color={palette.primary} />
                                <Text style={styles.statusLabel}>Loading storages…</Text>
                            </View>
                        ) : error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorTitle}>Unable to load storages</Text>
                                <Text style={styles.errorSubtitle}>{error}</Text>
                                <Pressable style={styles.retryButton} onPress={() => void loadListings()}>
                                    <Text style={styles.retryLabel}>Try again</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <PopularSection
                                listings={filteredListings}
                                showTotal={showTotal}
                                showMap={showMap}
                            />
                        )}
                    </View>
                </ScrollView>
                <Pressable
                    onPress={toggleMap}
                    style={[styles.mapToggleAction, showMap && styles.mapToggleActionActive]}
                >
                    <Ionicons
                        name={showMap ? 'map' : 'map-outline'}
                        size={18}
                        color={showMap ? '#FFF' : palette.primary}
                    />
                    <Text style={[styles.mapToggleText, showMap && styles.mapToggleTextActive]}>
                        {showMap ? 'Hide map view' : 'Show map view'}
                    </Text>
                </Pressable>
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 32 },
    sectionWrapper: {
        paddingHorizontal: 16,
    },
    sectionWrapperTablet: {
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
    },
    body: { marginTop: 24, paddingHorizontal: 16 },
    bodyTablet: {
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
        paddingHorizontal: 0,
    },
    statusContainer: {
        marginTop: 32,
        alignItems: 'center',
        gap: 12,
    },
    statusLabel: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    errorContainer: {
        marginTop: 24,
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
    mapToggleAction: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: palette.surface,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    mapToggleActionActive: {
        backgroundColor: palette.primary,
        borderColor: palette.primary,
    },
    mapToggleText: {
        marginLeft: 8,
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    mapToggleTextActive: {
        color: '#FFF',
    },
});

export default Home;