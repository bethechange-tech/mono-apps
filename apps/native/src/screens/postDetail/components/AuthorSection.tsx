import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, theme } from '@/theme';

type AuthorSectionProps = {
    initials: string;
    name: string;
    username: string;
    wordCount: number;
    onViewListing(): void;
    onViewPosts(): void;
};

type ActionButtonProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
};

const ActionButton = ({ icon, label, onPress }: ActionButtonProps) => (
    <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]} onPress={onPress}>
        <Ionicons name={icon} size={16} color={palette.primary} />
        <Text style={styles.actionButtonLabel}>{label}</Text>
    </Pressable>
);

export function AuthorSection({ initials, name, username, wordCount, onViewListing, onViewPosts }: AuthorSectionProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarLabel}>{initials}</Text>
                </View>
                <View style={styles.meta}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.handle}>@{username} · {wordCount} words</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <ActionButton icon="home-outline" label="View listing" onPress={onViewListing} />
                <ActionButton icon="book-outline" label="Host stories" onPress={onViewPosts} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: theme.radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
    },
    avatarLabel: {
        ...theme.typography.subtitle,
        color: palette.primary,
        fontWeight: '700',
    },
    meta: {
        flex: 1,
        gap: 4,
    },
    name: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontWeight: '600',
    },
    handle: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.primary,
        backgroundColor: palette.surface,
    },
    actionButtonPressed: {
        opacity: 0.85,
    },
    actionButtonLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
});
