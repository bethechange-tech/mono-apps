import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Screen from '@/components/Screen';
import { palette, theme } from '@/theme';
import { ListingCard } from './components/ListingCard';
import { listingRepository } from './domain/listingRepository';
import type { ListingSummary } from './domain/types';
import { useExploreStore } from './state/exploreStore';
import type { ExploreMode } from './state/exploreStore';

type ExploreSearchProps = {
    initialMode?: ExploreMode;
};

const MODES: ExploreMode[] = ['list', 'map'];

const ExploreSearch: React.FC<ExploreSearchProps> = ({ initialMode = 'list' }) => {
    const [listings, setListings] = React.useState<ListingSummary[]>([]);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const mode = useExploreStore((state) => state.mode);

    const setMode = useExploreStore((state) => state.setMode);
    const listingsLoading = useExploreStore((state) => state.listingsLoading);
    const setListingsLoading = useExploreStore((state) => state.setListingsLoading);
    const showTotal = useExploreStore((state) => state.showTotal);

    const loadListings = React.useCallback(async () => {
        setListingsLoading(true);
        setErrorMessage(null);
        try {
            const response = await listingRepository.list();
            setListings(response);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to load listings');
            setListings([]);
        } finally {
            setListingsLoading(false);
        }
    }, [setListingsLoading]);

    React.useEffect(() => {
        setMode(initialMode);
    }, [initialMode, setMode]);

    React.useEffect(() => {
        if (!listings.length) {
            void loadListings();
        }
    }, [listings.length, loadListings]);

    const renderListContent = () => (
        <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <ListingCard item={item} showTotal={showTotal} />}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            ListEmptyComponent={
                listingsLoading ? (
                    <ActivityIndicator color={palette.primary} style={styles.loader} />
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No spaces yet</Text>
                        <Text style={styles.emptySubtitle}>Check back soon for new storage spots in your area.</Text>
                    </View>
                )
            }
            refreshControl={
                <RefreshControl refreshing={listingsLoading} onRefresh={() => void loadListings()} />
            }
        />
    );

    const renderMapPlaceholder = () => (
        <View style={styles.mapPlaceholder}>
            <Text style={styles.mapTitle}>Map view coming soon</Text>
            <Text style={styles.mapSubtitle}>
                We&apos;re stitching in location data from the StashSpot API. Switch back to the list to browse available
                spaces.
            </Text>
            <Pressable style={styles.secondaryButton} onPress={() => setMode('list')}>
                <Text style={styles.secondaryButtonLabel}>View list</Text>
            </Pressable>
        </View>
    );

    return (
        <Screen>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Explore storages</Text>
                    <View style={styles.modeToggle}>
                        {MODES.map((option) => {
                            const isActive = mode === option;

                            return (
                                <Pressable
                                    key={option}
                                    style={[styles.modeButton, isActive && styles.modeButtonActive]}
                                    onPress={() => setMode(option)}
                                >
                                    <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                                        {option === 'list' ? 'List' : 'Map'}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {errorMessage ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTitle}>Unable to load storages</Text>
                        <Text style={styles.errorSubtitle}>{errorMessage}</Text>
                        <Pressable style={styles.retryButton} onPress={() => void loadListings()}>
                            <Text style={styles.retryLabel}>Try again</Text>
                        </Pressable>
                    </View>
                ) : mode === 'map' ? (
                    renderMapPlaceholder()
                ) : (
                    renderListContent()
                )}
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 12,
    },
    title: {
        ...theme.typography.title,
        color: palette.text,
    },
    modeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.surfaceAlt,
        borderRadius: theme.radii.pill,
        padding: 4,
        gap: 6,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: palette.surface,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    modeLabel: {
        ...theme.typography.caption,
        color: palette.textSubtle,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    modeLabelActive: {
        color: palette.text,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 16,
    },
    listSeparator: {
        height: 16,
    },
    loader: {
        marginTop: 32,
    },
    emptyState: {
        marginTop: 40,
        alignItems: 'center',
        gap: 8,
    },
    emptyTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    emptySubtitle: {
        ...theme.typography.body,
        color: palette.textMuted,
        textAlign: 'center',
    },
    mapPlaceholder: {
        flex: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    mapTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    mapSubtitle: {
        ...theme.typography.body,
        color: palette.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    secondaryButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: palette.surface,
    },
    secondaryButtonLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    errorContainer: {
        marginTop: 32,
        marginHorizontal: 16,
        padding: 20,
        borderRadius: theme.radii.xl,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
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
});

export default ExploreSearch;
