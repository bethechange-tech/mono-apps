import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import type { ScrollView as ScrollViewType, TextInput as TextInputElement } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '@/components/Screen';
import { palette, theme } from '@/theme';
import { Avatar } from './inbox/components/Avatar';
import { getInboxThread, getInitials, inboxQuickReplies, type ThreadMessage } from './inbox/data';
import { InboxStackParamList } from './inbox/types';

const STATUS_PRIORITY: Record<'sent' | 'delivered' | 'read', number> = {
    sent: 0,
    delivered: 1,
    read: 2,
};

export default function InboxThreadScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<InboxStackParamList>>();
    const route = useRoute<RouteProp<InboxStackParamList, 'InboxThread'>>();
    const thread = useMemo(() => getInboxThread(route.params.id), [route.params.id]);
    const insets = useSafeAreaInsets();
    const bottomInset = insets.bottom;
    const quickReplies = inboxQuickReplies;

    const [messages, setMessages] = useState<ThreadMessage[]>(() => thread?.messages ?? []);
    const [messageDraft, setMessageDraft] = useState('');
    const [isComposerFocused, setComposerFocused] = useState(false);

    const scrollViewRef = useRef<ScrollViewType | null>(null);
    const composerInputRef = useRef<TextInputElement | null>(null);
    const timeoutHandlesRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useLayoutEffect(() => {
        navigation.setOptions({ title: thread?.participant ?? 'Messages' });
    }, [navigation, thread]);

    useEffect(() => {
        setMessages(thread?.messages ?? []);
        setMessageDraft('');
    }, [thread]);

    useEffect(() => {
        return () => {
            timeoutHandlesRef.current.forEach((handle) => clearTimeout(handle));
            timeoutHandlesRef.current = [];
        };
    }, []);

    const registerTimeout = useCallback((callback: () => void, delay: number) => {
        const handle = setTimeout(() => {
            timeoutHandlesRef.current = timeoutHandlesRef.current.filter((entry) => entry !== handle);
            callback();
        }, delay);

        timeoutHandlesRef.current.push(handle);
        return handle;
    }, []);

    const scrollToEnd = useCallback(() => {
        requestAnimationFrame(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        });
    }, []);

    const focusComposer = useCallback(() => {
        requestAnimationFrame(() => {
            composerInputRef.current?.focus();
        });
    }, []);

    useEffect(() => {
        if (messages.length) {
            scrollToEnd();
        }
    }, [messages.length, scrollToEnd]);

    const handleDraftChange = useCallback((text: string) => {
        setMessageDraft(text);
    }, []);

    const updateMessageStatus = useCallback((messageId: string, nextStatus: 'sent' | 'delivered' | 'read') => {
        setMessages((prev) =>
            prev.map((msg) => {
                if (msg.id !== messageId) {
                    return msg;
                }

                if (msg.status === nextStatus) {
                    return msg;
                }

                if (msg.status && STATUS_PRIORITY[msg.status] > STATUS_PRIORITY[nextStatus]) {
                    return msg;
                }

                return { ...msg, status: nextStatus };
            }),
        );
    }, []);

    const scheduleAutoResponse = useCallback(
        (replyToMessageId: string) => {
            if (!thread) {
                return;
            }

            const firstName = thread.participant.split(' ')[0] ?? thread.participant;
            const responseSamples = [
                'Thanks, got it!',
                'Appreciate the update.',
                `Perfect, ${firstName}!`,
                'Sounds great — talk soon.',
                'Noted 👍',
            ];

            const delay = 1800 + Math.random() * 1500;

            registerTimeout(() => {
                const now = new Date();
                const response: ThreadMessage = {
                    id: `auto-${now.getTime()}`,
                    text: responseSamples[Math.floor(Math.random() * responseSamples.length)],
                    sentAt: formatTimeForDisplay(now),
                    fromUser: false,
                    dayLabel: getDayLabelForDate(now),
                };

                setMessages((prev) => {
                    const marked = prev.map((msg) =>
                        msg.id === replyToMessageId && msg.status !== 'read'
                            ? { ...msg, status: 'read' as ThreadMessage['status'] }
                            : msg,
                    );

                    return [...marked, response];
                });
            }, delay);
        },
        [registerTimeout, thread],
    );

    const sendMessage = useCallback(
        (rawContent: string) => {
            const content = rawContent.trim();
            if (!content.length) {
                return;
            }

            const now = new Date();
            const messageId = `local-${now.getTime()}`;

            const outgoing: ThreadMessage = {
                id: messageId,
                text: content,
                sentAt: formatTimeForDisplay(now),
                fromUser: true,
                dayLabel: getDayLabelForDate(now),
                status: 'sent',
            };

            setMessages((prev) => [...prev, outgoing]);
            setMessageDraft('');
            focusComposer();

            registerTimeout(() => updateMessageStatus(messageId, 'delivered'), 1200);
            registerTimeout(() => updateMessageStatus(messageId, 'read'), 2600);

            scheduleAutoResponse(messageId);
        },
        [focusComposer, registerTimeout, scheduleAutoResponse, updateMessageStatus],
    );

    const handleSendPress = useCallback(() => {
        sendMessage(messageDraft);
    }, [messageDraft, sendMessage]);

    const handleComposerSubmit = useCallback(() => {
        if (!messageDraft.trim()) {
            return;
        }

        sendMessage(messageDraft);
    }, [messageDraft, sendMessage]);

    const handleQuickReplyPress = useCallback(
        (reply: string) => {
            sendMessage(reply);
        },
        [sendMessage],
    );

    const shouldShowMic = !messageDraft.trim().length;
    const isSendDisabled = !messageDraft.trim().length;

    if (!thread) {
        return (
            <Screen>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>Conversation not found</Text>
                    <Text style={styles.emptySubtitle}>
                        We couldn't load this thread. Please head back to the inbox and try again.
                    </Text>
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
                        accessibilityRole="button"
                    >
                        <Text style={styles.emptyButtonLabel}>Back to inbox</Text>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    const activityLabel = getActivityLabel(thread.lastActive);
    const initials = getInitials(thread.participant);
    const latestMessage =
        messages[messages.length - 1] ?? thread.messages[thread.messages.length - 1];

    const renderDayDivider = (label: string) => (
        <View style={styles.dayDivider}>
            <View style={styles.dayDividerLine} />
            <Text style={styles.dayDividerLabel}>{label}</Text>
            <View style={styles.dayDividerLine} />
        </View>
    );

    const renderMessage = (message: ThreadMessage, index: number) => {
        const previous = index > 0 ? messages[index - 1] : undefined;
        const next = index < messages.length - 1 ? messages[index + 1] : undefined;
        const shareGroupWith = (other?: ThreadMessage) =>
            other && other.fromUser === message.fromUser && other.dayLabel === message.dayLabel;

        const isGroupedWithPrevious = Boolean(shareGroupWith(previous));
        const isGroupedWithNext = Boolean(shareGroupWith(next));
        const showDayDivider = Boolean(message.dayLabel && message.dayLabel !== previous?.dayLabel);
        const showAvatar = !message.fromUser && !isGroupedWithNext;
        const statusMeta = getStatusMeta(message.status);

        const bubbleStyles = [
            styles.messageBubble,
            message.fromUser ? styles.messageBubbleUser : styles.messageBubblePeer,
            isGroupedWithPrevious &&
            (message.fromUser
                ? styles.messageBubbleUserConnectedTop
                : styles.messageBubblePeerConnectedTop),
            isGroupedWithNext &&
            (message.fromUser
                ? styles.messageBubbleUserConnectedBottom
                : styles.messageBubblePeerConnectedBottom),
        ];

        return (
            <View key={message.id} style={styles.messageGroup}>
                {showDayDivider && message.dayLabel ? renderDayDivider(message.dayLabel) : null}
                <View
                    style={[
                        styles.messageRow,
                        message.fromUser ? styles.messageRowUser : styles.messageRowPeer,
                        isGroupedWithPrevious && styles.messageRowCondensed,
                    ]}
                >
                    {!message.fromUser ? (
                        <View style={styles.messageAvatarContainer}>
                            {showAvatar ? (
                                <Avatar uri={thread.avatar} label={initials} size={32} />
                            ) : (
                                <View style={styles.messageAvatarPlaceholder} />
                            )}
                        </View>
                    ) : (
                        <View style={styles.messageAvatarSpacer} />
                    )}

                    <View style={styles.messageBubbleStack}>
                        {message.fromUser ? (
                            <LinearGradient
                                colors={[palette.primary, palette.primaryAlt]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={bubbleStyles}
                            >
                                <Text style={[styles.messageText, styles.messageTextUser]}>{message.text}</Text>
                                <View style={[styles.messageMetaRow, styles.messageMetaRowUser]}>
                                    <Text style={[styles.messageTimestamp, styles.messageTimestampUser]}>
                                        {message.sentAt}
                                    </Text>
                                    {statusMeta && !isGroupedWithNext ? (
                                        <View style={styles.messageStatus}>
                                            <Ionicons
                                                name={statusMeta.icon}
                                                size={12}
                                                color={statusMeta.color}
                                                style={styles.messageStatusIcon}
                                            />
                                            <Text style={[styles.messageStatusLabel, { color: statusMeta.color }]}>
                                                {statusMeta.label}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            </LinearGradient>
                        ) : (
                            <View style={bubbleStyles}>
                                <Text style={[styles.messageText, styles.messageTextPeer]}>{message.text}</Text>
                                <View style={[styles.messageMetaRow, styles.messageMetaRowPeer]}>
                                    <Text style={[styles.messageTimestamp, styles.messageTimestampPeer]}>
                                        {message.sentAt}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Screen padded={false}>
            <KeyboardAvoidingView
                behavior={Platform.select({ ios: 'padding', android: 'height' })}
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 48 : 0}
                style={styles.screen}
            >
                <LinearGradient
                    colors={[palette.primary, '#7A8CE1']}
                    style={[styles.hero, { marginTop: -insets.top, paddingTop: 2 + insets.top }]}
                >
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>Conversation</Text>
                        <Text style={styles.heroSubtitle}>Stay connected with your renters.</Text>
                        <View style={styles.heroHeader}>
                            <Avatar uri={thread.avatar} label={initials} size={64} />
                            <View style={styles.heroMeta}>
                                <View style={styles.heroMetaHeader}>
                                    <Text style={styles.heroName}>{thread.participant}</Text>
                                    <View style={styles.heroStatusBadge}>
                                        <Ionicons name="time-outline" size={14} color={palette.overlay} />
                                        <Text style={styles.heroStatusLabel}>{activityLabel}</Text>
                                    </View>
                                </View>
                                <Text style={styles.heroHandle}>{thread.handle}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                <View style={[styles.chatContainer, { paddingBottom: 10 + bottomInset }]}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                        contentInsetAdjustmentBehavior="never"
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode="interactive"
                    >
                        {messages.map(renderMessage)}
                    </ScrollView>

                    {quickReplies.length ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.quickReplies}
                        >
                            {quickReplies.map((reply) => (
                                <Pressable
                                    key={reply}
                                    onPress={() => handleQuickReplyPress(reply)}
                                    style={({ pressed }) => [styles.quickReply, pressed && styles.quickReplyPressed]}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.quickReplyLabel}>{reply}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    ) : null}

                    <View style={styles.composer}>
                        <TouchableWithoutFeedback onPress={focusComposer} accessible={false}>
                            <View style={[styles.composerField, isComposerFocused && styles.composerFieldFocused]}>
                                <Ionicons
                                    name="add-circle-outline"
                                    size={22}
                                    color={palette.primary}
                                    style={styles.composerIcon}
                                />
                                <TextInput
                                    ref={composerInputRef}
                                    style={styles.composerInput}
                                    placeholder="Write a message…"
                                    placeholderTextColor={palette.textMuted}
                                    multiline
                                    value={messageDraft}
                                    onChangeText={handleDraftChange}
                                    onSubmitEditing={handleComposerSubmit}
                                    onFocus={() => {
                                        setComposerFocused(true);
                                        scrollToEnd();
                                    }}
                                    onBlur={() => setComposerFocused(false)}
                                    autoCorrect
                                    autoCapitalize="sentences"
                                    returnKeyType="send"
                                    blurOnSubmit={false}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                        {shouldShowMic ? (
                            <Pressable
                                style={({ pressed }) => [styles.micButton, pressed && styles.micButtonPressed]}
                                accessibilityRole="button"
                                accessibilityLabel="Voice message"
                            >
                                <Ionicons name="mic-outline" size={20} color={palette.primary} />
                            </Pressable>
                        ) : null}
                        <Pressable
                            disabled={isSendDisabled}
                            onPress={handleSendPress}
                            style={({ pressed }) => [
                                styles.sendButton,
                                isSendDisabled && styles.sendButtonDisabled,
                                pressed && !isSendDisabled && styles.sendButtonPressed,
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel="Send message"
                        >
                            <Ionicons name="send" size={18} color={palette.surface} style={styles.sendButtonIcon} />
                            <Text style={styles.sendButtonLabel}>Send</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const getActivityLabel = (lastActive: string | undefined) => {
    if (!lastActive) {
        return 'Active recently';
    }

    const value = lastActive.trim().toLowerCase();

    if (/^\d+[smh]$/.test(value)) {
        const amount = value.slice(0, -1);
        const unit = value.slice(-1);
        const unitLabel = unit === 's' ? 'sec' : unit === 'm' ? 'min' : 'hr';
        return `Active ${amount} ${unitLabel}${amount === '1' ? '' : 's'} ago`;
    }

    if (value === 'yesterday') {
        return 'Seen yesterday';
    }

    if (value === 'today') {
        return 'Seen today';
    }

    return `Seen ${lastActive}`;
};

const getStatusMeta = (status: string | undefined) => {
    switch (status) {
        case 'sent':
            return { icon: 'paper-plane-outline' as const, label: 'Sent', color: palette.textMuted };
        case 'delivered':
            return { icon: 'checkmark-done-outline' as const, label: 'Delivered', color: palette.textMuted };
        case 'read':
            return { icon: 'checkmark-done' as const, label: 'Read', color: palette.primary };
        default:
            return null;
    }
};

const formatTimeForDisplay = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const getDayLabelForDate = (date: Date) => {
    const todayStart = startOfDay(new Date());
    const targetStart = startOfDay(date);
    const diffMs = todayStart.getTime() - targetStart.getTime();
    const diffDays = Math.round(diffMs / 86_400_000);

    if (diffDays === 0) {
        return 'Today';
    }

    if (diffDays === 1) {
        return 'Yesterday';
    }

    if (diffDays < 7) {
        return date.toLocaleDateString(undefined, { weekday: 'long' });
    }

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    hero: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 24,
    },
    heroContent: {
        gap: 18,
    },
    heroTitle: {
        ...theme.typography.hero,
        color: palette.overlay,
    },
    heroSubtitle: {
        ...theme.typography.body,
        color: 'rgba(255,255,255,0.76)',
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    heroMeta: {
        flex: 1,
        gap: 6,
    },
    heroMetaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    heroName: {
        ...theme.typography.subtitle,
        color: palette.overlay,
        fontWeight: '700',
    },
    heroHandle: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.72)',
    },
    heroStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    heroStatusLabel: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.86)',
        fontWeight: '600',
    },
    heroSummary: {
        marginTop: 12,
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        gap: 6,
    },
    heroSummaryLabel: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.72)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontWeight: '600',
    },
    heroSummaryText: {
        ...theme.typography.body,
        color: palette.overlay,
    },
    chatContainer: {
        flex: 1,
        marginTop: -16,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: palette.background,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    messagesContent: {
        gap: 18,
        paddingBottom: 24,
    },
    messageGroup: {
        gap: 12,
    },
    dayDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        alignSelf: 'center',
    },
    dayDividerLine: {
        height: 1,
        width: 40,
        backgroundColor: palette.border,
    },
    dayDividerLabel: {
        ...theme.typography.caption,
        color: palette.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    messageRowPeer: {
        justifyContent: 'flex-start',
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    messageRowCondensed: {
        marginTop: -6,
    },
    messageAvatarContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    messageAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    messageAvatarSpacer: {
        width: 40,
    },
    messageBubbleStack: {
        maxWidth: '78%',
        flexShrink: 1,
    },
    messageBubble: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 6,
        shadowColor: 'rgba(15,23,42,0.12)',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 2,
        overflow: 'hidden',
    },
    messageBubblePeer: {
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
    },
    messageBubbleUser: {
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    messageBubblePeerConnectedTop: {
        borderTopLeftRadius: 8,
    },
    messageBubblePeerConnectedBottom: {
        borderBottomLeftRadius: 8,
    },
    messageBubbleUserConnectedTop: {
        borderTopRightRadius: 8,
    },
    messageBubbleUserConnectedBottom: {
        borderBottomRightRadius: 8,
    },
    messageText: {
        ...theme.typography.body,
    },
    messageTextPeer: {
        color: palette.text,
    },
    messageTextUser: {
        color: palette.surface,
    },
    messageMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    messageMetaRowPeer: {
        justifyContent: 'flex-start',
    },
    messageMetaRowUser: {
        justifyContent: 'flex-end',
    },
    messageTimestamp: {
        ...theme.typography.caption,
    },
    messageTimestampPeer: {
        color: palette.textMuted,
    },
    messageTimestampUser: {
        color: 'rgba(255,255,255,0.75)',
    },
    messageStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    messageStatusIcon: {
        marginTop: 1,
    },
    messageStatusLabel: {
        ...theme.typography.caption,
        fontWeight: '600',
    },
    quickReplies: {
        flexDirection: 'row',
        paddingHorizontal: 4,
        paddingBottom: 12,
    },
    quickReply: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surfaceAlt,
        marginRight: 10,
    },
    quickReplyPressed: {
        opacity: 0.85,
    },
    quickReplyLabel: {
        ...theme.typography.caption,
        color: palette.text,
        fontWeight: '600',
    },
    composer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 16,
    },
    composerField: {
        flex: 1,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surfaceAlt,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    composerFieldFocused: {
        borderColor: palette.primary,
        backgroundColor: palette.surface,
        shadowColor: 'rgba(255,90,95,0.15)',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 3,
    },
    composerIcon: {
        marginRight: 2,
    },
    composerInput: {
        flex: 1,
        ...theme.typography.body,
        color: palette.text,
        paddingVertical: 0,
        textAlignVertical: 'center',
        minHeight: 24,
        maxHeight: 120,
    },
    micButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    micButtonPressed: {
        opacity: 0.85,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.primary,
    },
    sendButtonDisabled: {
        backgroundColor: palette.primaryAlt,
        opacity: 0.6,
    },
    sendButtonPressed: {
        opacity: 0.9,
    },
    sendButtonIcon: {
        marginTop: -1,
    },
    sendButtonLabel: {
        ...theme.typography.label,
        color: palette.surface,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontWeight: '700',
    },
    emptySubtitle: {
        ...theme.typography.body,
        color: palette.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyButton: {
        marginTop: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.primary,
    },
    emptyButtonPressed: {
        opacity: 0.9,
    },
    emptyButtonLabel: {
        ...theme.typography.label,
        color: palette.surface,
        fontWeight: '700',
    },
});
