import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import GlobalErrorBoundary from './GlobalErrorBoundary';
import toastConfig from './toastConfig';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SafeAreaProvider>
            <GlobalErrorBoundary>
                {children}
            </GlobalErrorBoundary>
            <Toast config={toastConfig} />
        </SafeAreaProvider>
    );
};

export default AppProviders;
