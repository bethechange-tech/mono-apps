import { useMemo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/Screen';
import { palette, theme } from '@/theme';
import Avatar from './inbox/components/Avatar';
import { getInboxThread, getInitials } from './inbox/data';
import { InboxStackParamList } from './inbox/types';

export default function InboxProfileScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<InboxStackParamList>>();
    const route = useRoute<RouteProp<InboxStackParamList, 'InboxProfile'>>();
    const thread = useMemo(() => getInboxThread(route.params.id), [route.params.id]);

    if (!thread) {
        return (
            <Screen>
                <View style={styles.emptyState}>
                    <Ionicons name="alert-circle-outline" size={32} color={palette.textMuted} />
                    <Text style={styles.emptyTitle}>Profile unavailable</Text>
                    <Text style={styles.emptySubtitle}>We could not find details for this user.</Text>
                </View>
            </Screen>
        );
    }

    return (
        <Screen padded={false}>
            <View style={styles.container}>
                <View style={styles.hero}>
                    <Avatar uri={thread.avatar} label={getInitials(thread.participant)} size={72} style={styles.heroAvatar} />
                    <Text style={styles.heroName}>{thread.participant}</Text>
                    <Text style={styles.heroHandle}>{thread.handle}</Text>
                    <View style={styles.heroMetaRow}>
                        <View style={styles.metaPill}>
                            <Ionicons name="time-outline" size={14} color={palette.primary} />
                            <Text style={styles.metaPillLabel}>Active {thread.lastActive} ago</Text>
                        </View>
                        {thread.unreadCount ? (
                            <View style={styles.metaPill}>
                                <Ionicons name="chatbubble-outline" size={14} color={palette.primary} />
                                <Text style={styles.metaPillLabel}>{thread.unreadCount} unread message(s)</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Latest message</Text>
                    <View style={styles.messageCard}>
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color={palette.primary} />
                        <Text style={styles.messageText}>{thread.lastMessage}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick actions</Text>
                    <View style={styles.actionsRow}>
                        <Pressable
                            onPress={() => navigation.navigate('InboxThread', { id: thread.id })}
                            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={18} color={palette.primary} />
                            <Text style={styles.actionButtonLabel}>Open messages</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => navigation.navigate('InboxHome')}
                            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                        >
                            <Ionicons name="home-outline" size={18} color={palette.primary} />
                            <Text style={styles.actionButtonLabel}>Back to inbox</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.background,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 32,
        gap: 24,
    },
    hero: {
        alignItems: 'center',
        gap: 12,
        padding: 24,
        borderRadius: 24,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
    },
    heroAvatar: {
        borderWidth: 0,
    },
    heroName: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontWeight: '700',
    },
    heroHandle: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    heroMetaRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surfaceAlt,
    },
    metaPillLabel: {
        ...theme.typography.caption,
        color: palette.primary,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        ...theme.typography.body,
        color: palette.text,
        fontWeight: '600',
    },
    messageCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 16,
        borderRadius: 18,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
    },
    messageText: {
        ...theme.typography.caption,
        color: palette.textMuted,
        flex: 1,
    },
    actionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surfaceAlt,
    },
    actionButtonPressed: {
        backgroundColor: palette.highlight,
    },
    actionButtonLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
    },
    emptySubtitle: {
        ...theme.typography.caption,
        color: palette.textMuted,
        textAlign: 'center',
    },
});
