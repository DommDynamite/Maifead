import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEME_PRESETS, type ThemePresetKey, type ThemePreset } from '../theme/themePresets';

type ThemeMode = 'light' | 'dark';

export { THEME_PRESETS, type ThemePresetKey, type ThemePreset };

interface ThemeStore {
  mode: ThemeMode;
  themePreset: ThemePresetKey;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  setThemePreset: (preset: ThemePresetKey) => void;
  getActivePreset: () => ThemePreset;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      themePreset: 'teal',

      toggleTheme: () =>
        set(state => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),

      setTheme: mode => set({ mode }),

      setThemePreset: preset => set({ themePreset: preset }),

      getActivePreset: () => {
        const state = get();
        return THEME_PRESETS[state.themePreset];
      },
    }),
    {
      name: 'maifead-theme',
    }
  )
);
