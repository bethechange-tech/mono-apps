import type { MapView as ExpoMapView, Marker as ExpoMarker } from 'expo-maps';

export type MapComponents = {
    MapView?: typeof ExpoMapView;
    Marker?: typeof ExpoMarker;
};

let cachedComponents: MapComponents | null = null;

export function getMapComponents(): MapComponents {
    if (cachedComponents) {
        return cachedComponents;
    }

    try {
        const module = require('expo-maps');
        cachedComponents = {
            MapView: module.MapView,
            Marker: module.Marker,
        };
    } catch (error) {
        cachedComponents = {};
        console.warn('[home] expo-maps unavailable, falling back to placeholder map view.');
    }

    return cachedComponents;
}
