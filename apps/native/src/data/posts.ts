export type StoragePost = {
    id: string;
    content: string;
    images: string[];
    videos: string[];
    createdAt: string;
    user: {
        id: string;
        username: string;
        name: string;
    };
    storage: {
        id: string;
        title: string;
        location: string;
        pricePerMonth: number;
        rating: number;
        reviews: number;
        sizeSqFt: number;
        access: string;
        climateControlled: boolean;
        image: string;
        category: string;
        tags: string[];
    };
};

export const storagePosts: StoragePost[] = [
    {
        id: 'pst_123',
        content: 'New units available now! Reserve one of our keypad-secured bays and start earning by the weekend.',
        images: ['https://cdn.example.com/posts/pst_123/photo-1.jpg'],
        videos: ['https://videos.example.com/pst_123/intro.mp4'],
        createdAt: '2025-01-01T12:00:00Z',
        user: {
            id: 'usr_123',
            username: 'jane',
            name: 'Jane Doe',
        },
        storage: {
            id: 'stg_123',
            title: 'Secure Downtown Garage Space',
            location: 'San Francisco, CA',
            pricePerMonth: 249.99,
            rating: 4.8,
            reviews: 124,
            sizeSqFt: 200,
            access: '24/7 keypad access',
            climateControlled: true,
            image: 'https://cdn.example.com/images/stg_123_cover.jpg',
            category: 'garage',
            tags: ['Climate control'],
        },
    },
    {
        id: 'pst_207',
        content: 'We just opened climate-ready basement slots tailored for instrument storage. Soft lighting and humidity sensors installed.',
        images: ['https://cdn.example.com/posts/pst_207/photo-1.jpg', 'https://cdn.example.com/posts/pst_207/photo-2.jpg'],
        videos: [],
        createdAt: '2025-02-14T09:25:00Z',
        user: {
            id: 'usr_278',
            username: 'storagejournal',
            name: 'Storage Journal',
        },
        storage: {
            id: 'stg_441',
            title: 'Humidity-Controlled Brownstone Basement',
            location: 'Brooklyn, NY',
            pricePerMonth: 189,
            rating: 4.9,
            reviews: 86,
            sizeSqFt: 140,
            access: 'Weekdays 7am – 10pm',
            climateControlled: true,
            image: 'https://cdn.example.com/images/stg_441_cover.jpg',
            category: 'basement',
            tags: ['Climate control', 'Instrument ready'],
        },
    },
    {
        id: 'pst_332',
        content: 'Trialling app-based smart locks to keep contactless handoffs smooth for our renters. Here’s the install checklist we used.',
        images: ['https://cdn.example.com/posts/pst_332/photo-1.jpg'],
        videos: ['https://videos.example.com/pst_332/setup.mp4'],
        createdAt: '2025-03-22T17:40:00Z',
        user: {
            id: 'usr_410',
            username: 'hoststories',
            name: 'Host Stories',
        },
        storage: {
            id: 'stg_552',
            title: 'Contactless Loft Storage',
            location: 'Austin, TX',
            pricePerMonth: 169,
            rating: 4.7,
            reviews: 64,
            sizeSqFt: 175,
            access: 'App access 6am – 11pm',
            climateControlled: false,
            image: 'https://cdn.example.com/images/stg_552_cover.jpg',
            category: 'loft',
            tags: ['Smart locks', 'Contactless'],
        },
    },
    {
        id: 'pst_481',
        content: 'Reworked our shelving layout this week—labelled bins and pulldown ladders make weekend pickups effortless.',
        images: ['https://cdn.example.com/posts/pst_481/photo-1.jpg'],
        videos: [],
        createdAt: '2025-04-11T13:10:00Z',
        user: {
            id: 'usr_512',
            username: 'nehap',
            name: 'Neha Patel',
        },
        storage: {
            id: 'stg_619',
            title: 'Organised Warehouse Section',
            location: 'Manchester, UK',
            pricePerMonth: 132.5,
            rating: 4.9,
            reviews: 142,
            sizeSqFt: 260,
            access: 'Saturday collection window',
            climateControlled: true,
            image: 'https://cdn.example.com/images/stg_619_cover.jpg',
            category: 'warehouse',
            tags: ['Shelving', 'Operations'],
        },
    },
    {
        id: 'pst_509',
        content: 'Security audit checklist now live. Added cellular backup for cameras and refreshed insurance docs—feel free to copy ours.',
        images: ['https://cdn.example.com/posts/pst_509/photo-1.jpg'],
        videos: ['https://videos.example.com/pst_509/walkthrough.mp4'],
        createdAt: '2025-05-05T08:55:00Z',
        user: {
            id: 'usr_690',
            username: 'securecollective',
            name: 'Security Collective',
        },
        storage: {
            id: 'stg_702',
            title: 'Monitored Side Yard Pods',
            location: 'Portland, OR',
            pricePerMonth: 119,
            rating: 4.6,
            reviews: 58,
            sizeSqFt: 95,
            access: 'Guided access 8am – 8pm',
            climateControlled: false,
            image: 'https://cdn.example.com/images/stg_702_cover.jpg',
            category: 'outdoor',
            tags: ['Security', 'Insurance ready'],
        },
    },
];
