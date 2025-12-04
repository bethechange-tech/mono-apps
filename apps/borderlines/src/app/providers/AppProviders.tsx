import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStoryStore } from '@/modules/story';

const StoryBootstrap: React.FC = () => {
  const hasLoaded = useStoryStore((state) => state.hasLoaded);

  useEffect(() => {
    if (!hasLoaded) {
      useStoryStore
        .getState()
        .loadStories()
        .catch((error) => {
          console.warn('Failed to bootstrap stories', error);
        });
    }
  }, [hasLoaded]);

  return null;
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <StoryBootstrap />
      {children}
    </SafeAreaProvider>
  );
};

export default AppProviders;
