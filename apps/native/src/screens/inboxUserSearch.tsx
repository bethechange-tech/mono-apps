import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Screen from '@/components/Screen';
import { palette, theme } from '@/theme';
import { getInitials, inboxThreads } from './inbox/data';
import Avatar from './inbox/components/Avatar';
import { InboxStackParamList } from './inbox/types';

const QUICK_FILTERS = ['Storage pros', 'Verified hosts', 'Nearby', 'New conversations'] as const;

type QuickFilter = typeof QUICK_FILTERS[number];

type ResultItem = {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    lastMessage: string;
};

export default function InboxUserSearchScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<InboxStackParamList>>();
    const [query, setQuery] = useState('');
    const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null);

    const results = useMemo<ResultItem[]>(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return inboxThreads
            .filter((thread) => {
                if (activeQuickFilter === 'Nearby') {
                    return /min|m$/i.test(thread.lastActive);
                }
                if (activeQuickFilter === 'New conversations') {
                    return !thread.unreadCount;
                }
                return true;
            })
            .filter((thread) => {
                if (!normalizedQuery) {
                    return true;
                }
                const name = thread.participant.toLowerCase();
                const handle = thread.handle?.toLowerCase() ?? '';
                return name.includes(normalizedQuery) || handle.includes(normalizedQuery);
            })
            .map((thread) => ({
                id: thread.id,
                name: thread.participant,
                handle: thread.handle,
                avatar: thread.avatar,
                lastMessage: thread.lastMessage,
            }));
    }, [activeQuickFilter, query]);

    const handleClearQuery = () => {
        setQuery('');
    };

    const handleResultPress = (id: string) => {
        navigation.navigate('InboxThread', { id });
    };

    const handleProfilePress = (id: string) => {
        navigation.navigate('InboxProfile', { id });
    };

    return (
        <Screen padded={false}>
            <View style={styles.container}>
                <View style={styles.surface}>
                    <View style={styles.searchRow}>
                        <Ionicons name="search-outline" size={20} color={palette.textMuted} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search by name or handle"
                            placeholderTextColor={palette.textSubtle}
                            style={styles.input}
                            autoFocus
                            clearButtonMode="never"
                            returnKeyType="search"
                        />
                        {query ? (
                            <Pressable onPress={handleClearQuery} style={styles.clearButton} hitSlop={12}>
                                <Ionicons name="close-circle" size={18} color={palette.textSubtle} />
                            </Pressable>
                        ) : null}
                    </View>
                    <Text style={styles.helperText}>Try searching for renters to send updates or quick replies.</Text>
                </View>

                <View style={styles.quickFilterRow}>
                    {QUICK_FILTERS.map((filter) => {
                        const isActive = activeQuickFilter === filter;
                        return (
                            <Pressable
                                key={filter}
                                onPress={() => setActiveQuickFilter((current) => (current === filter ? null : filter))}
                                style={[styles.quickFilterChip, isActive && styles.quickFilterChipActive]}
                            >
                                <Text style={[styles.quickFilterLabel, isActive && styles.quickFilterLabelActive]}>
                                    {filter}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={results.length ? styles.listContent : styles.listEmptyContent}
                    renderItem={({ item }) => (
                        <View style={styles.resultRow}>
                            <Pressable
                                onPress={() => handleResultPress(item.id)}
                                style={({ pressed }) => [styles.resultMain, pressed && styles.resultMainPressed]}
                            >
                                <Avatar uri={item.avatar} label={getInitials(item.name)} style={styles.resultAvatar} />
                                <View style={styles.resultCopy}>
                                    <View style={styles.resultHeader}>
                                        <Text style={styles.resultName}>{item.name}</Text>
                                        {!!item.handle && <Text style={styles.resultHandle}>{item.handle}</Text>}
                                    </View>
                                    <Text style={styles.resultPreview} numberOfLines={1}>
                                        {item.lastMessage}
                                    </Text>
                                </View>
                                <Ionicons name="chatbubble-ellipses-outline" size={16} color={palette.primary} />
                            </Pressable>
                            <View style={styles.resultActions}>
                                <Pressable
                                    onPress={() => handleResultPress(item.id)}
                                    style={({ pressed }) => [styles.resultActionChip, pressed && styles.resultActionChipPressed]}
                                >
                                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={palette.primary} />
                                    <Text style={styles.resultActionLabel}>View message</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleProfilePress(item.id)}
                                    style={({ pressed }) => [styles.resultActionChip, pressed && styles.resultActionChipPressed]}
                                >
                                    <Ionicons name="person-circle-outline" size={14} color={palette.primary} />
                                    <Text style={styles.resultActionLabel}>View profile</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={28} color={palette.textMuted} />
                            <Text style={styles.emptyTitle}>No matches yet</Text>
                            <Text style={styles.emptySubtitle}>Try a different name or search by handle.</Text>
                        </View>
                    )}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.background,
        paddingHorizontal: 18,
        paddingTop: 0,
        paddingBottom: 12,
        gap: 8,
    },
    surface: {
        padding: 8,
        borderRadius: 14,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        gap: 6,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: theme.radii.sm,
        borderWidth: 1,
        borderColor: palette.border,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: palette.surfaceAlt,
    },
    input: {
        flex: 1,
        ...theme.typography.body,
        color: palette.text,
    },
    clearButton: {
        marginLeft: 8,
    },
    helperText: {
        ...theme.typography.caption,
        color: palette.textMuted,
        marginTop: 0,
    },
    quickFilterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    quickFilterChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surfaceAlt,
    },
    quickFilterChipActive: {
        backgroundColor: palette.primary,
        borderColor: palette.primary,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    quickFilterLabel: {
        ...theme.typography.caption,
        color: palette.textMuted,
        fontWeight: '600',
    },
    quickFilterLabelActive: {
        color: palette.surface,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    listContent: {
        backgroundColor: palette.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 2,
        gap: 2,
    },
    listEmptyContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 18,
    },
    resultRow: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    resultMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: theme.radii.lg,
        backgroundColor: palette.surfaceAlt,
    },
    resultMainPressed: {
        opacity: 0.85,
    },
    resultAvatar: {
        borderWidth: 0,
        backgroundColor: palette.surfaceAlt,
    },
    resultCopy: {
        flex: 1,
        gap: 4,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resultName: {
        ...theme.typography.body,
        color: palette.text,
        fontWeight: '600',
    },
    resultHandle: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    resultPreview: {
        ...theme.typography.caption,
        color: palette.textMuted,
    },
    resultActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 12,
    },
    resultActionChip: {
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
    resultActionChipPressed: {
        backgroundColor: palette.highlight,
    },
    resultActionLabel: {
        ...theme.typography.caption,
        color: palette.primary,
        fontWeight: '600',
    },
    emptyState: {
        gap: 10,
        alignItems: 'center',
    },
    emptyTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...theme.typography.caption,
        color: palette.textMuted,
        textAlign: 'center',
    },
});
