import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import AppProviders from '@/app/providers/AppProviders';
import AppNavigator from '@/app/navigation/AppNavigator';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <AppNavigator />
      </View>
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
