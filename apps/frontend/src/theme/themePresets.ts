// Complete theme presets with all color variations
// Each preset includes colors for both light and dark modes

export interface ThemePreset {
  name: string;
  // Brand colors (used in both modes)
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;
  primaryDark: string;

  // Light mode specific colors
  light: {
    background: string;
    surface: string;
    surfaceHover: string;
    surfaceActive: string;
    border: string;
    borderHover: string;
  };

  // Dark mode specific colors
  dark: {
    background: string;
    surface: string;
    surfaceHover: string;
    surfaceActive: string;
    border: string;
    borderHover: string;
  };
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  teal: {
    name: 'Teal',
    primary: '#00B4A6',
    primaryHover: '#009B8F',
    primaryActive: '#008075',
    primaryLight: '#E0F7F5',
    primaryDark: '#006B61',
    light: {
      background: '#FAFAFA',
      surface: '#FFFFFF',
      surfaceHover: '#F5F5F5',
      surfaceActive: '#EEEEEE',
      border: '#E5E5E5',
      borderHover: '#D4D4D4',
    },
    dark: {
      background: '#1E1E1E',
      surface: '#2A2A2A',
      surfaceHover: '#333333',
      surfaceActive: '#3D3D3D',
      border: '#404040',
      borderHover: '#525252',
    },
  },

  blue: {
    name: 'Blue',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryActive: '#1D4ED8',
    primaryLight: '#DBEAFE',
    primaryDark: '#1E40AF',
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceHover: '#F1F5F9',
      surfaceActive: '#E2E8F0',
      border: '#CBD5E1',
      borderHover: '#94A3B8',
    },
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      surfaceHover: '#334155',
      surfaceActive: '#475569',
      border: '#475569',
      borderHover: '#64748B',
    },
  },

  purple: {
    name: 'Purple',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    primaryActive: '#6D28D9',
    primaryLight: '#EDE9FE',
    primaryDark: '#5B21B6',
    light: {
      background: '#FAFAFC',
      surface: '#FFFFFF',
      surfaceHover: '#F5F3FF',
      surfaceActive: '#EDE9FE',
      border: '#E9D5FF',
      borderHover: '#D8B4FE',
    },
    dark: {
      background: '#1A1625',
      surface: '#2D1B4E',
      surfaceHover: '#3D2860',
      surfaceActive: '#4C3470',
      border: '#4C1D95',
      borderHover: '#6B21A8',
    },
  },

  pink: {
    name: 'Pink',
    primary: '#EC4899',
    primaryHover: '#DB2777',
    primaryActive: '#BE185D',
    primaryLight: '#FCE7F3',
    primaryDark: '#9F1239',
    light: {
      background: '#FDF4F9',
      surface: '#FFFFFF',
      surfaceHover: '#FCE7F3',
      surfaceActive: '#FBCFE8',
      border: '#F9A8D4',
      borderHover: '#F472B6',
    },
    dark: {
      background: '#1F1421',
      surface: '#3B1E3B',
      surfaceHover: '#4C2753',
      surfaceActive: '#5E3166',
      border: '#831843',
      borderHover: '#9D174D',
    },
  },

  orange: {
    name: 'Orange',
    primary: '#F97316',
    primaryHover: '#EA580C',
    primaryActive: '#C2410C',
    primaryLight: '#FFEDD5',
    primaryDark: '#9A3412',
    light: {
      background: '#FFFAF5',
      surface: '#FFFFFF',
      surfaceHover: '#FFF7ED',
      surfaceActive: '#FFEDD5',
      border: '#FED7AA',
      borderHover: '#FDBA74',
    },
    dark: {
      background: '#1F1814',
      surface: '#3B2817',
      surfaceHover: '#4C3219',
      surfaceActive: '#5E3E1C',
      border: '#7C2D12',
      borderHover: '#9A3412',
    },
  },

  green: {
    name: 'Green',
    primary: '#10B981',
    primaryHover: '#059669',
    primaryActive: '#047857',
    primaryLight: '#D1FAE5',
    primaryDark: '#065F46',
    light: {
      background: '#F6FEF9',
      surface: '#FFFFFF',
      surfaceHover: '#ECFDF5',
      surfaceActive: '#D1FAE5',
      border: '#A7F3D0',
      borderHover: '#6EE7B7',
    },
    dark: {
      background: '#14211C',
      surface: '#1F3B2F',
      surfaceHover: '#2A4D3C',
      surfaceActive: '#356048',
      border: '#064E3B',
      borderHover: '#065F46',
    },
  },

  red: {
    name: 'Red',
    primary: '#EF4444',
    primaryHover: '#DC2626',
    primaryActive: '#B91C1C',
    primaryLight: '#FEE2E2',
    primaryDark: '#991B1B',
    light: {
      background: '#FEF7F7',
      surface: '#FFFFFF',
      surfaceHover: '#FEF2F2',
      surfaceActive: '#FEE2E2',
      border: '#FECACA',
      borderHover: '#FCA5A5',
    },
    dark: {
      background: '#211414',
      surface: '#3B1F1F',
      surfaceHover: '#4C2626',
      surfaceActive: '#5E2E2E',
      border: '#7F1D1D',
      borderHover: '#991B1B',
    },
  },

  amber: {
    name: 'Amber',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryActive: '#B45309',
    primaryLight: '#FEF3C7',
    primaryDark: '#92400E',
    light: {
      background: '#FFFBF0',
      surface: '#FFFFFF',
      surfaceHover: '#FEF3C7',
      surfaceActive: '#FDE68A',
      border: '#FCD34D',
      borderHover: '#FBBF24',
    },
    dark: {
      background: '#1F1C14',
      surface: '#3B3217',
      surfaceHover: '#4C3F19',
      surfaceActive: '#5E4D1C',
      border: '#78350F',
      borderHover: '#92400E',
    },
  },

  // Additional sophisticated presets
  slate: {
    name: 'Slate',
    primary: '#64748B',
    primaryHover: '#475569',
    primaryActive: '#334155',
    primaryLight: '#E2E8F0',
    primaryDark: '#1E293B',
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceHover: '#F1F5F9',
      surfaceActive: '#E2E8F0',
      border: '#CBD5E1',
      borderHover: '#94A3B8',
    },
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      surfaceHover: '#334155',
      surfaceActive: '#475569',
      border: '#475569',
      borderHover: '#64748B',
    },
  },

  indigo: {
    name: 'Indigo',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryActive: '#4338CA',
    primaryLight: '#E0E7FF',
    primaryDark: '#3730A3',
    light: {
      background: '#FAFAFF',
      surface: '#FFFFFF',
      surfaceHover: '#E0E7FF',
      surfaceActive: '#C7D2FE',
      border: '#A5B4FC',
      borderHover: '#818CF8',
    },
    dark: {
      background: '#171726',
      surface: '#27273F',
      surfaceHover: '#363654',
      surfaceActive: '#454569',
      border: '#3730A3',
      borderHover: '#4338CA',
    },
  },
};

export type ThemePresetKey = keyof typeof THEME_PRESETS;
