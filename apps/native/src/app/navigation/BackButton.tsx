import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { palette } from '@/theme';

type Props = {
    tintColor?: string;
    onPress?: () => void;
};

export const BackButton: React.FC<Props> = ({ tintColor = palette.text, onPress }) => {
    const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();

    const handlePress = () => {
        if (onPress) {
            onPress();
            return;
        }
        if (navigation.canGoBack?.()) {
            navigation.goBack?.();
        }
    };

    return (
        <Pressable onPress={handlePress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Ionicons name="chevron-back" size={22} color={tintColor} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surface,
    },
    buttonPressed: {
        backgroundColor: palette.surfaceAlt,
    },
});

export default BackButton;
