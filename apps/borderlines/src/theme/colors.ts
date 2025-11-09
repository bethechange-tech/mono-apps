import type { ColorValue } from 'react-native';

// Borderlines-specific palette tuned to the reading/discovery UI
export const palette = {
  // Backgrounds (fully white app, subtle alt)
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F7FB',
  overlay: '#FFFFFF',

  // Borders & dividers
  border: '#E4E7F2',
  divider: '#EDF1FA',

  // Brand (deep blue primary to match cards/icons)
  primary: '#2256F2',
  primaryAlt: '#1B46C4',
  accent: '#FFB547',

  // Text
  text: '#111827',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',

  // Feedback
  success: '#16A34A',
  warning: '#FACC15',
  danger: '#DC2626',

  // Highlight / focus
  highlight: '#EDF2FF',
  focus: '#2256F2',
} as const;

export type GradientStops = readonly [ColorValue, ColorValue, ...ColorValue[]];

export const gradients: Record<'hero' | 'card' | 'cta', GradientStops> = {
  hero: ['#2256F2', '#1B46C4'],
  card: ['#FFFFFF', '#F8FAFF'],
  cta: ['#2256F2', '#1B46C4'],
};
