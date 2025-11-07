export type ListingCategory = 'all' | 'garage' | 'basement' | 'room' | 'attic' | 'outdoor';

export type Listing = {
    id: string;
    title: string;
    location: string;
    pricePerMonth: number;
    rating: number;
    reviews: number;
    sizeSqFt: number;
    access: string;
    climateControlled: boolean;
    image: string; // remote URL
    category?: ListingCategory;
    tags?: string[]; // amenities like climate control, security, etc.
    coordinate?: {
        latitude: number;
        longitude: number;
    };
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
        category: 'garage',
        tags: ['Power outlet', 'Security cameras', 'Drive-up access'],
        coordinate: { latitude: 40.6782, longitude: -73.9442 },
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
        category: 'basement',
        tags: ['Dehumidifier', 'Lockable door', 'Street parking'],
        coordinate: { latitude: 41.8781, longitude: -87.6298 },
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
        category: 'room',
        tags: ['Climate controlled', 'Covered shelving', 'Host on-site'],
        coordinate: { latitude: 39.7392, longitude: -104.9903 },
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
        category: 'outdoor',
        tags: ['Covered', 'Easy pull-in', 'Motion lighting'],
        coordinate: { latitude: 30.2672, longitude: -97.7431 },
    },
];
