import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  resolvedMode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  initialize: () => () => void;
}

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return (await SecureStore.getItemAsync(name)) || null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Ignore write errors
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Ignore remove errors
    }
  },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark', // Default according to design.md
      resolvedMode: 'dark',
      setMode: (mode) => {
        const systemTheme = Appearance.getColorScheme();
        const resolvedMode = mode === 'system' ? (systemTheme === 'light' ? 'light' : 'dark') : mode;
        set({ mode, resolvedMode });
      },
      initialize: () => {
        // Listen to system theme changes
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
          if (get().mode === 'system') {
            set({ resolvedMode: colorScheme === 'light' ? 'light' : 'dark' });
          }
        });
        
        // Sync the theme on initial run
        const currentMode = get().mode;
        const systemTheme = Appearance.getColorScheme();
        const resolvedMode = currentMode === 'system' ? (systemTheme === 'light' ? 'light' : 'dark') : currentMode;
        set({ resolvedMode });
        
        return () => {
          subscription.remove();
        };
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        mode: state.mode,
        resolvedMode: state.resolvedMode,
      }),
    }
  )
);
