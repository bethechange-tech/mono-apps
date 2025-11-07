
import type { ColorValue } from 'react-native';

// Light theme aligned to the provided design (coral primary, soft light backgrounds)
export const palette = {
    // Neutrals
    background: '#F7F7F9',       // app background (soft light gray)
    surface: '#FFFFFF',          // cards/surfaces
    surfaceAlt: '#FAFAFC',       // elevated surfaces
    overlay: '#FFFFFF',          // overlays/sheets
    border: '#E6E8EE',           // subtle borders
    divider: '#EDF0F5',          // stronger separators

    // Brand (coral)
    primary: '#FF5A5F',          // actionable coral
    primaryAlt: '#FF6E73',       // hover/pressed coral
    accent: '#FF8A80',           // complementary warm accent

    // Feedback
    success: '#2ECC71',          // success (green)
    warning: '#F2C94C',          // warning (amber)
    danger: '#E63946',           // destructive (red)

    // Content
    text: '#1F2937',             // primary text (near-black)
    textMuted: '#6B7280',        // secondary text
    textSubtle: '#9CA3AF',       // tertiary/captions

    // Highlights
    highlight: '#FDECEC',        // interactive highlight/pressed (tinted)
    focus: '#FF5A5F',            // focus ring (coral)
} as const;

export type GradientStops = readonly [ColorValue, ColorValue, ...ColorValue[]];

// Gradients reflecting coral accents
export const gradients: Record<'hero' | 'card' | 'cta', GradientStops> = {
    hero: ['#FF6E73', '#FF5A5F'] as GradientStops,
    card: ['#FFFFFF', '#FAFAFC'] as GradientStops,
    cta: ['#FF5A5F', '#FF6E73'] as GradientStops,
};
