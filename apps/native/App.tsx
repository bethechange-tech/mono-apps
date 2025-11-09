import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, palette } from '@/theme';
import AppProviders from '@/app/providers/AppProviders';
import AppNavigator from '@/app/navigation/AppNavigator';
import { initializeGlobalErrorHandling } from '@/app/errors/globalErrorHandler';

initializeGlobalErrorHandling();

// Silence upstream deprecation warning from RN core SafeAreaView usage in dependencies
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

// Keep splash visible immediately on app load to avoid flicker until we're ready
void SplashScreen.preventAutoHideAsync();

export default function App() {
    const [navReady, setNavReady] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(true);
    const fade = useRef(new Animated.Value(1)).current;
    const overlayVisibleRef = useRef(true);

    // Match system background to splash/theme to avoid white flash on load
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(palette.background).catch(() => { });
    }, []);

    const fadeOutOverlay = useCallback(() => {
        if (!overlayVisibleRef.current) return;
        overlayVisibleRef.current = false;
        Animated.timing(fade, {
            toValue: 0,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => setOverlayVisible(false));
    }, [fade]);

    const handleNavigationReady = useCallback(() => {
        setNavReady(true);
        SplashScreen.hideAsync().catch(() => { });
        fadeOutOverlay();
    }, [fadeOutOverlay]);

    useEffect(() => {
        overlayVisibleRef.current = overlayVisible;
    }, [overlayVisible]);

    // Fallback hide in case onReady delays in dev or edge cases
    useEffect(() => {
        if (navReady) return;
        const t = setTimeout(() => {
            SplashScreen.hideAsync().catch(() => { });
            fadeOutOverlay();
        }, 4000);
        return () => clearTimeout(t);
    }, [navReady, fadeOutOverlay]);

    return (
        <AppProviders>
            <StatusBar style="dark" />
            <View style={{ flex: 1, backgroundColor: palette.background }}>
                <AppNavigator onReady={handleNavigationReady} />
                {overlayVisible && (
                    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, { opacity: fade }]}>
                        <LinearGradient colors={gradients.hero} style={StyleSheet.absoluteFill} />
                        <View style={styles.brandRow}>
                            <Image
                                source={require('./assets/logo-wordmark.png')}
                                resizeMode="contain"
                                style={styles.logo}
                            />
                            <ActivityIndicator size="small" color={palette.surface} style={styles.spinner} />
                        </View>
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
    brandRow: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 24,
    },
    spinner: {
        transform: [{ translateY: -8 }],
    },
});
