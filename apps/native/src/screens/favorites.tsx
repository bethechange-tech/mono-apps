import Screen from '@/components/Screen';
import { Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export default function FavoritesScreen() {
    return (
        <Screen>
            <Text style={styles.title}>Favorites</Text>
            <Text style={styles.subtitle}>Your saved listings will appear here.</Text>
        </Screen>
    );
}

const styles = StyleSheet.create({
    title: { ...theme.typography.hero },
    subtitle: { ...theme.typography.body, color: theme.palette.textMuted, marginTop: 8 },
});
