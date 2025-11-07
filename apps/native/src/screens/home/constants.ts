import { Ionicons } from '@expo/vector-icons';

export type HomeCategory = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export const HOME_CATEGORIES: HomeCategory[] = [
    { id: 'all', label: 'All spaces', icon: 'grid-outline' },
    { id: 'garage', label: 'Garages', icon: 'car-sport-outline' },
    { id: 'basement', label: 'Basements', icon: 'archive-outline' },
    { id: 'room', label: 'Spare rooms', icon: 'bed-outline' },
    { id: 'attic', label: 'Attics', icon: 'cube-outline' },
    { id: 'outdoor', label: 'Outdoor', icon: 'leaf-outline' },
];
