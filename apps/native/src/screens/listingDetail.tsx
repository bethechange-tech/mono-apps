import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { palette, theme } from '@/theme';
import { listingRepository } from '@/features/explore/domain/listingRepository';
import type { Listing } from '@/features/explore/domain/types';
import Screen from '@/components/Screen';

type ParamList = {
    ListingDetail: { id: string };
};

export default function ListingDetailScreen() {
    const route = useRoute<RouteProp<ParamList, 'ListingDetail'>>();
    const { id } = route.params;
    const [item, setItem] = React.useState<Listing | undefined>();
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await listingRepository.get(id);
                if (mounted) setItem(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    if (loading) {
        return <Screen><Text style={styles.loading}>Loading...</Text></Screen>;
    }
    if (!item) {
        return <Screen><Text style={styles.loading}>Listing not found.</Text></Screen>;
    }

    return (
        <Screen padded={false}>
            <ScrollView contentContainerStyle={styles.container}>
                <Image source={{ uri: item.image }} style={styles.hero} resizeMode="cover" />
                <View style={styles.body}>
                    <Text style={styles.title}>{item.title}</Text>
                    <View style={styles.row}>
                        <Text style={styles.location}>{item.location}</Text>
                        <Text style={styles.rating}> ⭐ {item.rating} ({item.reviews})</Text>
                    </View>
                    <Text style={styles.meta}>{item.sizeSqFt} sq ft • {item.access} access • {item.climateControlled ? 'Climate controlled' : 'Not climate controlled'}</Text>
                    <View style={styles.tagsWrap}>
                        {item.tags?.map(t => (
                            <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                        ))}
                    </View>
                    <Text style={styles.price}>£{item.pricePerMonth} <Text style={styles.night}>/Month · 3 months £{item.pricePerMonth * 3}</Text></Text>
                    <Pressable style={styles.bookBtn} onPress={() => { /* booking flow later */ }}>
                        <Text style={styles.bookText}>Reserve Space</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: 40 },
    hero: { width: '100%', height: 280, backgroundColor: palette.surfaceAlt },
    body: { padding: 16 },
    title: { ...theme.typography.title },
    row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
    location: { ...theme.typography.caption, color: palette.textMuted },
    rating: { ...theme.typography.caption, color: palette.text },
    meta: { ...theme.typography.caption, color: palette.textMuted, marginTop: 8 },
    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    tag: { backgroundColor: palette.highlight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.radii.pill },
    tagText: { ...theme.typography.caption, color: palette.primary, fontWeight: '600' },
    price: { ...theme.typography.subtitle, marginTop: 20 },
    night: { ...theme.typography.caption, color: palette.textMuted },
    bookBtn: { marginTop: 24, backgroundColor: palette.primary, paddingVertical: 14, borderRadius: theme.radii.pill, alignItems: 'center' },
    bookText: { ...theme.typography.subtitle, color: palette.background },
    loading: { ...theme.typography.body, padding: 20 },
});