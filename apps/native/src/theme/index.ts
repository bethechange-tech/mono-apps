
import { DefaultTheme, Theme } from '@react-navigation/native';
import { gradients, palette } from './colors';

export const theme = {
    palette,
    gradients,
    spacing: (factor: number) => Math.round(factor * 8),
    radii: {
        xs: 6,
        sm: 10,
        md: 14,
        lg: 18,
        xl: 24,
        pill: 999,
    },
    elevation: {
        // mimic depth with background colors; RN shadows differ by platform
        level0: { backgroundColor: palette.background },
        level1: { backgroundColor: palette.surface },
        level2: { backgroundColor: palette.surfaceAlt },
    },
    typography: {
        display: { fontSize: 36, fontWeight: '800' as const, letterSpacing: 0.4 },
        hero: { fontSize: 30, fontWeight: '700' as const, letterSpacing: 0.3 },
        title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: 0.2 },
        subtitle: { fontSize: 18, fontWeight: '600' as const, letterSpacing: 0.15 },
        body: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0.1 },
        label: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.2 },
        caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.2 },
        mono: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0.2 },
    },
} as const;

export const navigationTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        background: palette.background,
        card: palette.surface,
        border: palette.border,
        primary: palette.primary,
        text: palette.text,
        notification: palette.accent,
    }
};

export type AppTheme = typeof theme;

export { palette, gradients } from './colors';
