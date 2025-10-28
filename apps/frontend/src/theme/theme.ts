// Brand colors
const brand = {
  primary: '#00B4A6',
  primaryHover: '#009B8F',
  primaryActive: '#008075',
  primaryLight: '#E0F7F5',
  primaryDark: '#006B61',
};

// Light theme colors
const lightColors = {
  // Backgrounds
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceHover: '#F5F5F5',
  surfaceActive: '#EEEEEE',

  // Borders
  border: '#E5E5E5',
  borderHover: '#D4D4D4',
  borderFocus: brand.primary,

  // Text
  text: '#1A1A1A',
  textSecondary: '#737373',
  textTertiary: '#A3A3A3',
  textInverse: '#FFFFFF',

  // Semantic colors
  success: '#22C55E',
  successBg: '#F0FDF4',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',
  secondary: '#737373',
  secondaryBg: '#F5F5F5',
};

// Dark theme colors (Obsidian-inspired)
const darkColors = {
  // Backgrounds
  background: '#1E1E1E',
  surface: '#2A2A2A',
  surfaceHover: '#333333',
  surfaceActive: '#3D3D3D',

  // Borders
  border: '#404040',
  borderHover: '#525252',
  borderFocus: brand.primary,

  // Text
  text: '#E5E5E5',
  textSecondary: '#A3A3A3',
  textTertiary: '#737373',
  textInverse: '#1A1A1A',

  // Semantic colors (adjusted for dark mode)
  success: '#22C55E',
  successBg: '#14532D',
  warning: '#F59E0B',
  warningBg: '#451A03',
  error: '#EF4444',
  errorBg: '#450A0A',
  danger: '#EF4444',
  dangerBg: '#450A0A',
  info: '#3B82F6',
  infoBg: '#1E3A8A',
  secondary: '#A3A3A3',
  secondaryBg: '#333333',
};

// Typography
const fonts = {
  sans: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,
  mono: `'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Cascadia Code', 'Roboto Mono', monospace`,
};

const fontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
};

const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

// Spacing (8px grid)
const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
};

// Border radius
const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  full: '9999px',
};

// Shadows
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Transitions
const transitions = {
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-index scale
const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
};

// Build complete themes
export const lightTheme = {
  name: 'light',
  colors: {
    ...brand,
    ...lightColors,
  },
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
};

export const darkTheme = {
  name: 'dark',
  colors: {
    ...brand,
    ...darkColors,
  },
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    // Reduce shadow opacity for dark mode
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.12)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
  },
  transitions,
  breakpoints,
  zIndex,
};

// Type for theme
export type Theme = typeof lightTheme;

// Export default theme
export const defaultTheme = darkTheme;
