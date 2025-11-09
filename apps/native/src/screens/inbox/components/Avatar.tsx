import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { palette, theme } from '@/theme';

export type AvatarProps = {
    uri?: string;
    label: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
};

export const Avatar = ({ uri, label, size = 54, style }: AvatarProps) => {
    const borderRadius = size / 2;
    return (
        <View style={[styles.shell, { width: size, height: size, borderRadius }, style]}>
            {uri ? (
                <Image source={{ uri }} style={styles.image} />
            ) : (
                <View style={[styles.image, styles.fallback]}>
                    <Text style={styles.fallbackLabel}>{label}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    shell: {
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.48)',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    fallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surfaceAlt,
    },
    fallbackLabel: {
        ...theme.typography.subtitle,
        color: palette.primary,
        fontWeight: '700',
    },
});

export default Avatar;
