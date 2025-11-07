import Screen from '@/components/Screen';
import { Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export default function TripsScreen() {
    return (
        <Screen>
            <Text style={styles.title}>Trips</Text>
            <Text style={styles.subtitle}>Upcoming and past trips.</Text>
        </Screen>
    );
}

const styles = StyleSheet.create({
    title: { ...theme.typography.hero },
    subtitle: { ...theme.typography.body, color: theme.palette.textMuted, marginTop: 8 },
});
