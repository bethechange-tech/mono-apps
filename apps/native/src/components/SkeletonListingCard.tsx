import React from 'react';
import { View, StyleSheet } from 'react-native';
import { palette, theme } from '@/theme';
import Shimmer from '@/components/Shimmer';

export default function SkeletonListingCard() {
    return (
        <View style={styles.card}>
            <Shimmer style={styles.image} radius={theme.radii.md} />
            <View style={styles.body}>
                <Shimmer style={{ width: '60%', height: 16, marginBottom: 8 }} radius={6} />
                <Shimmer style={{ width: '40%', height: 12, marginBottom: 6 }} radius={6} />
                <Shimmer style={{ width: '30%', height: 12, marginBottom: 6 }} radius={6} />
                <Shimmer style={{ width: '50%', height: 12 }} radius={6} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.radii.md,
        overflow: 'hidden',
        backgroundColor: palette.surface,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: palette.border,
    },
    image: { width: '100%', height: 160, backgroundColor: palette.surfaceAlt },
    body: { padding: 12, gap: 6 }
});
