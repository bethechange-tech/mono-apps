import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { palette } from '@/theme';

type ScreenProps = {
    children: ReactNode;
    style?: ViewStyle;
    padded?: boolean;
};

export function Screen({ children, style, padded = true }: ScreenProps) {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.container, padded && styles.padded, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: { flex: 1 },
    padded: { padding: 16 },
});

export default Screen;
