export type ThreadMessage = {
    id: string;
    text: string;
    sentAt: string;
    fromUser: boolean;
    dayLabel?: string;
    status?: 'sent' | 'delivered' | 'read';
};

export type MessageThread = {
    id: string;
    participant: string;
    handle: string;
    avatar: string;
    lastMessage: string;
    lastActive: string;
    unreadCount?: number;
    messages: ThreadMessage[];
};

const THREADS: MessageThread[] = [
    {
        id: 'thread-1',
        participant: 'Julian Devlin',
        handle: '@julian.devlin',
        avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=160&h=160&crop=faces',
        lastMessage: 'Great, see you tomorrow morning!',
        lastActive: '2m',
        unreadCount: 2,
        messages: [
            { id: 'm-1', text: 'Hey Julian 👋 Just checking you got the pickup note?', sentAt: '09:14', fromUser: true, dayLabel: 'Today', status: 'delivered' },
            { id: 'm-2', text: 'Yes! Thanks for sending that through.', sentAt: '09:16', fromUser: false },
            { id: 'm-3', text: 'Great, see you tomorrow morning!', sentAt: '09:17', fromUser: false },
        ],
    },
    {
        id: 'thread-2',
        participant: 'Mike Lopez',
        handle: '@mikelo',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=160&h=160&crop=faces',
        lastMessage: "I'll be there in 10 mins.",
        lastActive: '1h',
        messages: [
            { id: 'm-4', text: 'Morning! Loading dock is free now if you need it.', sentAt: '08:01', fromUser: true, dayLabel: 'Today', status: 'read' },
            { id: 'm-5', text: "Amazing, I'll be there in 10 mins.", sentAt: '08:02', fromUser: false },
        ],
    },
    {
        id: 'thread-3',
        participant: 'Claire Kumar',
        handle: '@clairek',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&crop=faces',
        lastMessage: 'Could I extend through next week?',
        lastActive: '3h',
        messages: [
            { id: 'm-6', text: 'Could I extend through next week?', sentAt: '06:41', fromUser: false, dayLabel: 'Yesterday' },
            { id: 'm-7', text: 'Absolutely, I can update the booking today.', sentAt: '06:45', fromUser: true, status: 'sent' },
        ],
    },
    {
        id: 'thread-4',
        participant: 'Blair Dale',
        handle: '@blaird',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=160&h=160&crop=faces',
        lastMessage: 'Thanks for the quick turnaround!',
        lastActive: 'Yesterday',
        messages: [
            { id: 'm-8', text: 'Package arrived right on time. Thanks for the quick turnaround!', sentAt: 'Yesterday', fromUser: false, dayLabel: 'Earlier this week' },
        ],
    },
];

export const inboxThreads = THREADS;

export const getInboxThread = (id: string) => inboxThreads.find((thread) => thread.id === id);

export const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
        return '?';
    }
    return parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
};

export const inboxQuickReplies = ['On my way', 'Thank you!', 'Sounds good'];
