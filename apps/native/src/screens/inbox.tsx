import { useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/Screen';
import { palette, theme } from '@/theme';
import { inboxThreads, getInitials } from './inbox/data';
import Avatar from './inbox/components/Avatar';
import { InboxStackParamList } from './inbox/types';

export default function InboxScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<InboxStackParamList>>();
    const threads = useMemo(() => inboxThreads, []);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'recent'>('all');

    const stats = useMemo(() => {
        const unreadThreads = threads.filter((thread) => Boolean(thread.unreadCount));
        const activeToday = threads.filter((thread) => /m$|h$/i.test(thread.lastActive));

        return [
            { id: 'unread', label: 'Unread threads', value: unreadThreads.length.toString(), icon: 'mail-unread-outline' as const },
            { id: 'active', label: 'Active today', value: activeToday.length.toString(), icon: 'time-outline' as const },
            { id: 'response', label: 'Response time', value: '< 5 min', icon: 'flash-outline' as const },
        ];
    }, [threads]);

    const filters = useMemo(
        () => [
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'recent', label: 'Recent' },
        ],
        []
    );

    const filteredThreads = useMemo(() => {
        if (activeFilter === 'unread') {
            return threads.filter((thread) => Boolean(thread.unreadCount));
        }
        if (activeFilter === 'recent') {
            return threads.filter((thread) => /m$|h$/i.test(thread.lastActive));
        }
        return threads;
    }, [activeFilter, threads]);

    const emptyStateCopy = useMemo(() => {
        if (activeFilter === 'unread') {
            return {
                title: 'All caught up',
                subtitle: 'No unread messages. Enjoy the quiet!'
            };
        }
        if (activeFilter === 'recent') {
            return {
                title: "It's been a minute",
                subtitle: 'No new pings in the last few hours.'
            };
        }
        return {
            title: 'No conversations yet',
            subtitle: 'Start chatting with renters to see threads appear here.'
        };
    }, [activeFilter]);

    const handleSearchUsersPress = () => {
        navigation.navigate('InboxUserSearch');
    };

    return (
        <Screen padded={false}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
            >
                <LinearGradient colors={[palette.primary, '#7A8CE1']} style={styles.hero}>
                    <View style={styles.heroHeaderRow}>
                        <View style={styles.heroCopy}>
                            <Text style={styles.heroTitle}>Messages</Text>
                            <Text style={styles.heroSubtitle}>Keep conversations flowing with your renters.</Text>
                        </View>
                        <View style={styles.heroActions}>
                            <Pressable onPress={handleSearchUsersPress} style={styles.heroActionSecondary}>
                                <Ionicons name="search-outline" size={18} color={palette.overlay} />
                                <Text style={styles.heroActionLabelSecondary}>Find users</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.heroStatsRow}>
                        {stats.map((stat) => (
                            <View key={stat.id} style={styles.heroStatCard}>
                                <View style={styles.heroStatIcon}>
                                    <Ionicons name={stat.icon} size={18} color={palette.primary} />
                                </View>
                                <View>
                                    <Text style={styles.heroStatValue}>{stat.value}</Text>
                                    <Text style={styles.heroStatLabel}>{stat.label}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={styles.heroAvatarRow}>
                        {threads.slice(0, 5).map((thread) => (
                            <Avatar
                                key={thread.id}
                                uri={thread.avatar}
                                label={getInitials(thread.participant)}
                            />
                        ))}
                    </View>
                </LinearGradient>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                    style={styles.filterRow}
                >
                    {filters.map((filter) => {
                        const isActive = activeFilter === filter.id;
                        return (
                            <Pressable
                                key={filter.id}
                                onPress={() => setActiveFilter(filter.id as typeof activeFilter)}
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                            >
                                <Text style={[styles.filterChipLabel, isActive && styles.filterChipLabelActive]}>
                                    {filter.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Recent messages</Text>
                        <Text style={styles.cardSubtitle}>Swipe through updates from your hosts and renters.</Text>
                    </View>
                    <FlatList
                        data={filteredThreads}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={styles.threadDivider} />}
                        renderItem={({ item }) => {
                            return (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.threadRow,
                                        pressed && styles.threadRowPressed,
                                    ]}
                                    onPress={() => navigation.navigate('InboxThread', { id: item.id })}
                                >
                                    <Avatar
                                        uri={item.avatar}
                                        label={getInitials(item.participant)}
                                        style={styles.threadAvatar}
                                    />
                                    <View style={styles.threadMeta}>
                                        <View style={styles.threadMetaHeader}>
                                            <Text style={styles.threadName}>{item.participant}</Text>
                                            <Text style={styles.threadTime}>{item.lastActive}</Text>
                                        </View>
                                        <Text style={styles.threadPreview} numberOfLines={1}>
                                            {item.lastMessage}
                                        </Text>
                                    </View>
                                    {item.unreadCount ? (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadLabel}>{item.unreadCount}</Text>
                                        </View>
                                    ) : null}
                                </Pressable>
                            );
                        }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbox-ellipses-outline" size={28} color={palette.textMuted} />
                                <Text style={styles.emptyStateTitle}>{emptyStateCopy.title}</Text>
                                <Text style={styles.emptyStateSubtitle}>{emptyStateCopy.subtitle}</Text>
                            </View>
                        )}
                    />
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 48,
        backgroundColor: palette.background,
    },
    hero: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 24,
        gap: 20,
    },
    heroHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },
    heroCopy: {
        flex: 1,
        gap: 6,
    },
    heroTitle: {
        ...theme.typography.hero,
        color: palette.overlay,
    },
    heroSubtitle: {
        ...theme.typography.body,
        color: 'rgba(255,255,255,0.76)',
    },
    heroActions: {
        gap: 10,
        alignItems: 'flex-end',
    },
    heroActionPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: palette.overlay,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: theme.radii.pill,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    heroActionLabelPrimary: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    heroActionSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.34)',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroActionLabelSecondary: {
        ...theme.typography.caption,
        color: palette.overlay,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    heroStatsRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    heroStatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexGrow: 1,
        minWidth: 120,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: theme.radii.lg,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.24)',
    },
    heroStatIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: palette.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroStatValue: {
        ...theme.typography.subtitle,
        color: palette.overlay,
        fontWeight: '700',
    },
    heroStatLabel: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.78)',
    },
    heroAvatarRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    filterRow: {
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    filterScroll: {
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        marginRight: 12,
    },
    filterChipActive: {
        backgroundColor: palette.primary,
        borderColor: palette.primary,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    filterChipLabel: {
        ...theme.typography.caption,
        color: palette.textMuted,
        fontWeight: '600',
    },
    filterChipLabelActive: {
        color: palette.surface,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    card: {
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 22,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        gap: 16,
    },
    cardHeader: {
        gap: 4,
    },
    cardTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontWeight: '700',
    },
    cardSubtitle: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    threadDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: palette.border,
        marginLeft: 68,
    },
    threadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 6,
        borderRadius: theme.radii.lg,
        gap: 14,
    },
    threadRowPressed: {
        opacity: 0.82,
    },
    threadAvatar: {
        borderWidth: 0,
        backgroundColor: palette.surfaceAlt,
    },
    threadMeta: {
        flex: 1,
        gap: 4,
    },
    threadMetaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    threadName: {
        ...theme.typography.body,
        color: palette.text,
        fontWeight: '600',
    },
    threadTime: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    threadPreview: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    unreadBadge: {
        minWidth: 26,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadLabel: {
        ...theme.typography.caption,
        color: palette.surface,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        gap: 10,
        paddingVertical: 32,
    },
    emptyStateTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        ...theme.typography.caption,
        color: palette.textMuted,
        textAlign: 'center',
    },
});
