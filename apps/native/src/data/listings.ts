import type { OpenApiJsonResponse } from 'stashspot-api-types';

export type ListStoragesResponse = OpenApiJsonResponse<'listStorages', 200>;
export type ListingSummary = ListStoragesResponse[number];
export type ListingCategory = NonNullable<ListingSummary['category']>;

export type GetStorageResponse = OpenApiJsonResponse<'getStorage', 200>;
export type ListingPost = GetStorageResponse['posts'][number];

export type Listing = GetStorageResponse & {
    images?: string[];
};

export const listings: Listing[] = [
    {
        id: '1',
        title: 'Heated Garage Loft Storage',
        location: 'Brooklyn, NY',
        pricePerMonth: 240,
        rating: 4.9,
        reviews: 128,
        sizeSqFt: 140,
        access: '24/7 keypad',
        climateControlled: true,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop',
        ],
        category: 'garage',
        tags: ['Power outlet', 'Security cameras', 'Drive-up access'],
        coordinate: { latitude: 40.6782, longitude: -73.9442 },
        posts: [
            {
                id: 'pst_101',
                content: 'Added two new bays with upgraded motion cameras. Reserve a slot before the weekend rush!',
                createdAt: '2025-03-04T15:20:00Z',
                images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop'],
                user: {
                    id: 'usr_320',
                    username: 'bkhost',
                    name: 'Maya Lopez',
                },
            },
        ],
    },
    {
        id: '2',
        title: 'Dry Basement for Boxes & Gear',
        location: 'Chicago, IL',
        pricePerMonth: 165,
        rating: 4.7,
        reviews: 86,
        sizeSqFt: 180,
        access: 'Daily 7a-9p',
        climateControlled: false,
        image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505692766503-0bd8d30d92e8?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        ],
        category: 'basement',
        tags: ['Dehumidifier', 'Lockable door', 'Street parking'],
        coordinate: { latitude: 41.8781, longitude: -87.6298 },
        posts: [
            {
                id: 'pst_207',
                content: 'Humidity monitors recalibrated—perfect for instruments and vinyl collections again.',
                createdAt: '2025-02-18T10:05:00Z',
                images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop'],
                user: {
                    id: 'usr_501',
                    username: 'storagejournal',
                    name: 'Storage Journal',
                },
            },
        ],
    },
    {
        id: '3',
        title: 'Secure Spare Room Storage',
        location: 'Denver, CO',
        pricePerMonth: 195,
        rating: 4.8,
        reviews: 102,
        sizeSqFt: 160,
        access: 'Contactless entry',
        climateControlled: true,
        image: 'https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?q=80&w=1200&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1529278255321-06986021cb5b?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
        ],
        category: 'room',
        tags: ['Climate controlled', 'Covered shelving', 'Host on-site'],
        coordinate: { latitude: 39.7392, longitude: -104.9903 },
        posts: [
            {
                id: 'pst_332',
                content: 'Swapped in smart lock access—renters now check in with the app in under 30 seconds.',
                createdAt: '2025-03-22T17:40:00Z',
                images: ['https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?q=80&w=1600&auto=format&fit=crop'],
                user: {
                    id: 'usr_410',
                    username: 'hoststories',
                    name: 'Host Stories',
                },
            },
        ],
    },
    {
        id: '4',
        title: 'Covered Driveway Parking Spot',
        location: 'Austin, TX',
        pricePerMonth: 110,
        rating: 4.5,
        reviews: 64,
        sizeSqFt: 200,
        access: '24/7 gate',
        climateControlled: false,
        image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1488292078616-79b1618f0d7b?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop',
        ],
        category: 'outdoor',
        tags: ['Covered', 'Easy pull-in', 'Motion lighting'],
        coordinate: { latitude: 30.2672, longitude: -97.7431 },
        posts: [
            {
                id: 'pst_481',
                content: 'Installed fresh canopy panels to block spring showers—spots available now.',
                createdAt: '2025-04-11T13:10:00Z',
                images: ['https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1600&auto=format&fit=crop'],
                user: {
                    id: 'usr_512',
                    username: 'nehap',
                    name: 'Neha Patel',
                },
            },
        ],
    },
];
