import Screen from '@/components/Screen';
import { Text, View, StyleSheet } from 'react-native';
import { palette, theme } from '@/theme';

export default function MapSearchScreen() {
    return (
        <Screen>
            <View style={styles.searchBox}>
                <Text style={styles.placeholder}>Your location</Text>
                <Text style={styles.placeholder}>New York City</Text>
            </View>
            <View style={styles.mapArea} />
            <View style={styles.etaCard}>
                <Text style={theme.typography.label}>20 min (2.5 km)</Text>
                <Text style={styles.muted}>Some traffic, as usual</Text>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    searchBox: {
        backgroundColor: palette.surface,
        padding: 12,
        borderRadius: theme.radii.md,
        gap: 6,
        marginBottom: 12,
    },
    placeholder: { ...theme.typography.body, color: palette.textMuted },
    mapArea: {
        flex: 1,
        backgroundColor: '#232A3B',
        borderRadius: theme.radii.md,
    },
    etaCard: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: palette.surface,
        padding: 12,
        borderRadius: theme.radii.md,
    },
    muted: { ...theme.typography.caption, color: palette.textMuted },
});
