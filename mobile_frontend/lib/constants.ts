// Design system tokens copied and adapted from webapp

export const Colors = {
  // Primary — Vibrant Blue (oklch(0.55 0.18 250))
  primary: '#1468ff', // Adjusted for mobile visibility
  primaryLight: '#5ca8ff',
  primaryDark: '#0284c7',

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',

  // Dark Mode (Primary Mode for Mobile)
  dark: {
    background: '#0a0d14',
    surface: '#111827',
    surfaceStrong: '#1a1f2e',
    card: 'rgba(28, 35, 50, 0.8)',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#f3f7fb',
    textSecondary: '#9aa6b2',
    textMuted: '#64748b',
    panelStart: 'rgba(12, 17, 24, 0.92)',
    panelEnd: 'rgba(17, 24, 34, 0.9)',
    highlight: 'rgba(255, 255, 255, 0.05)',
  },

  // Light Mode
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceStrong: '#f1f5f9',
    card: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(15, 23, 42, 0.08)',
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    panelStart: 'rgba(255, 255, 255, 0.98)',
    panelEnd: 'rgba(248, 250, 252, 0.95)',
    highlight: 'rgba(255, 255, 255, 1)',
  },
} as const

export const Fonts = {
  // We'll use system fonts provided by React Native and Expo, which map well to Inter/San Francisco
  families: {
    english: 'System', // Maps to San Francisco on iOS, Roboto on Android
    thai: 'Prompt-Regular',  // Modern Thai typeface matching the website
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 42,
  },
  weights: {
    regular: '400' as const,
    medium: '400' as const, // Reduced from 500
    semibold: '500' as const, // Reduced from 600
    bold: '600' as const, // Reduced from 700
    black: '700' as const, // Reduced from 900
  },
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 50,
  full: 9999,
} as const

export const BrandColors: Record<string, string> = {
  samsung: '#1428a0',
  apple: '#555555',
  xiaomi: '#ff6900',
  oppo: '#1a8a1a',
  vivo: '#415fff',
  realme: '#f5c518',
  huawei: '#cf0a2c',
  google: '#4285f4',
  oneplus: '#eb0028',
  nothing: '#000000',
}
