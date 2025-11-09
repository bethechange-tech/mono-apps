import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/theme';
import { homeStyles } from '../../home.styles';

export type HomeLoadingStateProps = {
  label?: string;
};

export const HomeLoadingState: React.FC<HomeLoadingStateProps> = ({ label = 'Loading stories...' }) => {
  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <View style={homeStyles.loadingContainer}>
        <ActivityIndicator size="small" color={palette.primary} />
        <Text style={homeStyles.loadingLabel}>{label}</Text>
      </View>
    </SafeAreaView>
  );
};

export default HomeLoadingState;
