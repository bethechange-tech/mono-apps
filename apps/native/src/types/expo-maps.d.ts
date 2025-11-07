declare module 'expo-maps' {
    import * as React from 'react';
    import { ViewProps } from 'react-native';

    export type MapCoordinate = {
        latitude: number;
        longitude: number;
    };

    export type CameraPosition = {
        center: MapCoordinate;
        pitch?: number;
        heading?: number;
        zoom: number;
    };

    export interface MapViewProps extends ViewProps {
        initialCameraPosition?: CameraPosition;
    }

    export class MapView extends React.Component<MapViewProps> { }

    export interface MarkerProps {
        coordinate: MapCoordinate;
        title?: string;
        description?: string;
    }

    export class Marker extends React.Component<MarkerProps> { }
}
