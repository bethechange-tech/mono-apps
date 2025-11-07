import Screen from '@/components/Screen';
import { Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export default function InboxScreen() {
    return (
        <Screen>
            <Text style={styles.title}>Inbox</Text>
            <Text style={styles.subtitle}>Messages and notifications.</Text>
        </Screen>
    );
}

const styles = StyleSheet.create({
    title: { ...theme.typography.hero },
    subtitle: { ...theme.typography.body, color: theme.palette.textMuted, marginTop: 8 },
});
