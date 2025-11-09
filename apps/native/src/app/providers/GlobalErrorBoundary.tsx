import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { palette, theme } from '@/theme';

interface GlobalErrorBoundaryProps {
    children: React.ReactNode;
}

interface GlobalErrorBoundaryState {
    error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
    state: GlobalErrorBoundaryState = {
        error: null,
    };

    static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught application error', error, errorInfo);
        Toast.show({
            type: 'error',
            text1: 'Unexpected error',
            text2: error.message || 'An unexpected error occurred.',
            topOffset: 64,
        });
    }

    private handleReset = () => {
        this.setState({ error: null });
    };

    render() {
        const { error } = this.state;
        if (error) {
            return (
                <View style={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.message}>
                            {error.message || 'An unexpected error occurred. You can try refreshing the app.'}
                        </Text>
                        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={this.handleReset}>
                            <Text style={styles.buttonLabel}>Try again</Text>
                        </Pressable>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.background,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 320,
        borderRadius: theme.radii.lg,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 24,
        gap: 16,
    },
    title: {
        ...theme.typography.subtitle,
        color: palette.text,
        fontWeight: '700',
        textAlign: 'center',
    },
    message: {
        ...theme.typography.body,
        color: palette.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: theme.radii.pill,
        backgroundColor: palette.primary,
    },
    buttonPressed: {
        opacity: 0.92,
    },
    buttonLabel: {
        ...theme.typography.label,
        color: palette.surface,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
});

export default GlobalErrorBoundary;
