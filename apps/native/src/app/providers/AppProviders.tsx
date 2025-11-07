import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SafeAreaProvider>
            {children}
        </SafeAreaProvider>
    );
};

export default AppProviders;
