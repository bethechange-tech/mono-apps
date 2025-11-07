import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { listings } from '@/data/listings';
import { useHomeFilters, useHomeMap, useHomePricing } from '@/store/homeStore';
import { HeroSection } from './home/HeroSection';
import { SearchCard } from './home/SearchCard';
import { TotalPriceToggle } from './home/TotalPriceToggle';
import { PopularSection } from './home/PopularSection';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';

const Home = () => {
    const { category, setCategory } = useHomeFilters();
    const { showTotal, setShowTotal } = useHomePricing();
    const { showMap, toggleMap } = useHomeMap();

    const filteredListings = useMemo(() => {
        if (category === 'all') return listings;
        return listings.filter((item) => item.category?.toLowerCase() === category);
    }, [category]);

    return (
        <Screen padded={false}>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <HeroSection />
                    <SearchCard selectedCategory={category} onSelectCategory={setCategory} />

                    <View style={styles.body}>
                        <TotalPriceToggle value={showTotal} onChange={setShowTotal} />
                        <PopularSection
                            listings={filteredListings}
                            showTotal={showTotal}
                            showMap={showMap}
                        />
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
    body: { marginTop: 24, paddingHorizontal: 24 },
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