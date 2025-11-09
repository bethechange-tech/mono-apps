import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BookmarkCategory = 'law' | 'personal';

export type BookmarkPayload = {
  id: string;
  title: string;
  subtitle: string;
  category: BookmarkCategory;
  countryTag?: string;
  routeTag?: string;
  daysAgo: number;
  likes?: number;
};

export type BookmarkStory = BookmarkPayload & {
  savedAt: string;
};

type BookmarkState = {
  bookmarks: BookmarkStory[];
  toggleBookmark: (story: BookmarkPayload) => void;
  removeBookmark: (id: string) => void;
  clearBookmarks: () => void;
  isBookmarked: (id: string) => boolean;
};

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      toggleBookmark: (story) => {
        set((state) => {
          const exists = state.bookmarks.some((item) => item.id === story.id);
          if (exists) {
            return {
              bookmarks: state.bookmarks.filter((item) => item.id !== story.id),
            };
          }

          const nextItem: BookmarkStory = {
            ...story,
            savedAt: new Date().toISOString(),
          };

          return { bookmarks: [nextItem, ...state.bookmarks] };
        });
      },
      removeBookmark: (id) => {
        set((state) => ({ bookmarks: state.bookmarks.filter((item) => item.id !== id) }));
      },
      clearBookmarks: () => {
        set({ bookmarks: [] });
      },
      isBookmarked: (id) => get().bookmarks.some((item) => item.id === id),
    }),
    {
      name: 'borderlines/bookmarks',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ bookmarks: state.bookmarks }),
    }
  )
);

export default useBookmarkStore;

export const useBookmarkHydration = () => {
  const [hydrated, setHydrated] = useState(useBookmarkStore.persist.hasHydrated());

  useEffect(() => {
    const unsubFinish = useBookmarkStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    const unsubHydrate = useBookmarkStore.persist.onHydrate?.(() => {
      setHydrated(false);
    });

    return () => {
      unsubFinish?.();
      unsubHydrate?.();
    };
  }, []);

  return hydrated;
};
