import React from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface ShimmerProps {
    style?: ViewStyle | ViewStyle[];
    radius?: number;
}

export const Shimmer: React.FC<ShimmerProps> = ({ style, radius = 8 }) => {
    const translateX = React.useRef(new Animated.Value(-150)).current;
    React.useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(translateX, { toValue: 150, duration: 1100, useNativeDriver: true }),
                Animated.timing(translateX, { toValue: -150, duration: 0, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [translateX]);
    return (
        <View style={[styles.base, { borderRadius: radius }, style]}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    { transform: [{ translateX }], backgroundColor: '#ffffff22' }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
        backgroundColor: '#E2E8F0',
    }
});

export default Shimmer;