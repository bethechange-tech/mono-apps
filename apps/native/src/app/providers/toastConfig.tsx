import React from 'react';
import { BaseToast, ErrorToast, type ToastConfig } from 'react-native-toast-message';
import { palette, theme } from '@/theme';

export const toastConfig: ToastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: palette.primary,
                backgroundColor: palette.surface,
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: palette.border,
            }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            text1Style={{
                ...theme.typography.subtitle,
                fontWeight: '600',
                color: palette.text,
            }}
            text2Style={{
                ...theme.typography.caption,
                color: palette.textMuted,
            }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: palette.accent,
                backgroundColor: palette.surface,
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: palette.border,
            }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            text1Style={{
                ...theme.typography.subtitle,
                fontWeight: '600',
                color: palette.text,
            }}
            text2Style={{
                ...theme.typography.caption,
                color: palette.textMuted,
            }}
        />
    ),
};

export default toastConfig;
