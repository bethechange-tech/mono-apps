import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStoryStore } from '@/modules/story';

const StoryBootstrap: React.FC = () => {
  const hasLoaded = useStoryStore((state) => state.hasLoaded);
  const loadStories = useStoryStore((state) => state.loadStories);

  useEffect(() => {
    if (!hasLoaded) {
      loadStories().catch((error) => {
        console.warn('Failed to bootstrap stories', error);
      });
    }
  }, [hasLoaded, loadStories]);

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
