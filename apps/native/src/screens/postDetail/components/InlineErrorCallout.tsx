import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, theme } from '@/theme';

type InlineErrorCalloutProps = {
    message: string;
    onRetry: () => void;
};

export function InlineErrorCallout({ message, onRetry }: InlineErrorCalloutProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Issue refreshing story</Text>
            <Text style={styles.subtitle}>{message}</Text>
            <Pressable style={styles.button} onPress={onRetry}>
                <Text style={styles.buttonLabel}>Retry</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        gap: 8,
    },
    title: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    subtitle: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    button: {
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: palette.surface,
    },
    buttonLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
});
