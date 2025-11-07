import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';
import type { Listing } from '@/data/listings';
import { ListingCard } from '@/components/ListingCard';
import { getMapComponents } from './mapLoader';

const { MapView, Marker } = getMapComponents();

type PopularSectionProps = {
    listings: Listing[];
    showTotal: boolean;
    showMap: boolean;
};

export function PopularSection({ listings, showTotal, showMap }: PopularSectionProps) {
    const mapListings = useMemo(() => listings.filter((item) => item.coordinate), [listings]);
    const mapCenter = useMemo(() => {
        if (mapListings.length && mapListings[0].coordinate) {
            return mapListings[0].coordinate;
        }
        return { latitude: 40.7128, longitude: -74.006 };
    }, [mapListings]);
    const mapZoom = mapListings.length > 1 ? 6 : 9;
    const mapKey = `${mapCenter.latitude}-${mapCenter.longitude}-${mapListings.length}-${mapListings
        .map((item) => item.id)
        .join('-')}`;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Popular storage spaces</Text>
            </View>
            {showMap && (
                <View style={styles.mapContainer}>
                    {MapView && Marker ? (
                        <MapView
                            key={mapKey}
                            style={StyleSheet.absoluteFillObject}
                            initialCameraPosition={{
                                center: mapCenter,
                                zoom: mapZoom,
                            }}
                        >
                            {mapListings.map((item) => (
                                item.coordinate ? (
                                    <Marker
                                        key={item.id}
                                        coordinate={item.coordinate}
                                        title={item.title}
                                        description={item.location}
                                    />
                                ) : null
                            ))}
                        </MapView>
                    ) : (
                        <View style={styles.mapEmpty}>
                            <Ionicons name="alert-circle" size={28} color={palette.primary} />
                            <Text style={styles.mapEmptyTitle}>Map unavailable</Text>
                            <Text style={styles.mapEmptyCaption}>
                                Install the Expo Maps module with a custom dev client to view storage hosts on the map.
                            </Text>
                        </View>
                    )}
                    {MapView && Marker && !mapListings.length && (
                        <View style={styles.mapEmpty}>
                            <Ionicons name="map" size={28} color={palette.primary} />
                            <Text style={styles.mapEmptyTitle}>No spaces mapped yet</Text>
                            <Text style={styles.mapEmptyCaption}>Try a different storage type to see available space.</Text>
                        </View>
                    )}
                </View>
            )}
            <View style={styles.listings}>
                {listings.map((item) => (
                    <ListingCard key={item.id} item={item} showTotal={showTotal} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 24 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        ...theme.typography.subtitle,
        color: palette.text,
        marginTop: 0,
        marginBottom: 0,
    },
    mapContainer: {
        height: 220,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: palette.border,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: palette.surface,
    },
    mapEmpty: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.surface,
        paddingHorizontal: 24,
    },
    mapEmptyTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
        marginTop: 8,
    },
    mapEmptyCaption: {
        ...theme.typography.caption,
        color: palette.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
    listings: { paddingBottom: 16 },
});
