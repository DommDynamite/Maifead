import React, { useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './theme';
import { GlobalStyles } from './GlobalStyles';
import { useThemeStore } from '../stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const mode = useThemeStore(state => state.mode);
  const themePreset = useThemeStore(state => state.themePreset);

  const theme = useMemo(() => {
    const baseTheme = mode === 'light' ? lightTheme : darkTheme;
    const preset = useThemeStore.getState().getActivePreset();

    // Get mode-specific colors from preset
    const modeColors = mode === 'light' ? preset.light : preset.dark;

    // Merge preset colors into the base theme
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        // Override with preset brand colors
        primary: preset.primary,
        primaryHover: preset.primaryHover,
        primaryActive: preset.primaryActive,
        primaryLight: preset.primaryLight,
        primaryDark: preset.primaryDark,
        // Override with mode-specific surface colors
        background: modeColors.background,
        surface: modeColors.surface,
        surfaceHover: modeColors.surfaceHover,
        surfaceActive: modeColors.surfaceActive,
        border: modeColors.border,
        borderHover: modeColors.borderHover,
        borderFocus: preset.primary,
      },
    };
  }, [mode, themePreset]);

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </StyledThemeProvider>
  );
};
