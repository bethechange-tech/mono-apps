
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox } from 'react-native';
import { palette } from '@/theme';
import AppProviders from '@/app/providers/AppProviders';
import AppNavigator from '@/app/navigation/AppNavigator';


// Silence upstream deprecation warning from RN core SafeAreaView usage in dependencies
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

// Keep splash visible immediately on app load to avoid flicker until we're ready
void SplashScreen.preventAutoHideAsync();

export default function App() {
    const [navReady, setNavReady] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(true);
    const fade = useRef(new Animated.Value(1)).current;

    // Match system background to splash/theme to avoid white flash on load
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(palette.background).catch(() => { });
    }, []);

    useEffect(() => {
        if (!navReady) return;
        SplashScreen.hideAsync().catch(() => { });
        // Smoothly fade out the branded overlay for a polished transition
        Animated.timing(fade, {
            toValue: 0,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => setOverlayVisible(false));
    }, [navReady, fade]);

    // Fallback hide in case onReady delays in dev or edge cases
    useEffect(() => {
        if (navReady) return;
        const t = setTimeout(() => SplashScreen.hideAsync().catch(() => { }), 4000);
        return () => clearTimeout(t);
    }, [navReady]);

    return (
        <AppProviders>
            <StatusBar style="light" />
            <View style={{ flex: 1, backgroundColor: palette.background }}>
                <AppNavigator onReady={() => setNavReady(true)} />
                {overlayVisible && (
                    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, { opacity: fade }]}>
                        <Image
                            source={require('./assets/logo-wordmark.png')}
                            resizeMode="contain"
                            style={styles.logo}
                        />
                    </Animated.View>
                )}
            </View>
        </AppProviders>
    );
}

const styles = StyleSheet.create({
    overlay: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.background,
    },
    logo: {
        width: 180,
        height: 180,
    },
});
