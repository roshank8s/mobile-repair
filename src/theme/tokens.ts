// Single source of truth for design tokens. Do NOT hardcode values elsewhere.

export const palette = {
  indigo950: '#1E1B4B',
  indigo900: '#312E81',
  indigo700: '#4338CA',
  indigo50: '#EEF0FF',

  amber500: '#F59E0B',
  amber400: '#FBBF24',
  amber50: '#FFF8E6',

  green600: '#16A34A',
  green50: '#E7F8EE',
  red600: '#DC2626',
  red50: '#FCE9E9',
  blue600: '#2563EB',
  blue50: '#E8EFFD',

  ink900: '#0A0A0A',
  ink700: '#262626',
  ink500: '#525252',
  ink400: '#737373',
  ink300: '#A3A3A3',
  ink200: '#D4D4D4',
  ink100: '#E5E5E5',
  ink50: '#F5F5F5',

  surface: '#FAF9F6',
  surfaceRaised: '#FFFFFF',
  surfaceMuted: '#F2F1ED',

  white: '#FFFFFF',
  black: '#000000',
};

export const colors = {
  primary: palette.indigo950,
  primaryRaised: palette.indigo900,
  primaryMuted: palette.indigo50,
  accent: palette.amber500,
  accentSoft: palette.amber50,

  // Canvas is now deep indigo across the app. Cards stay light so content
  // hierarchy reads cleanly on top of the saturated backdrop.
  bg: palette.indigo950,
  bgRaised: palette.indigo900,
  card: palette.surfaceRaised,
  cardMuted: palette.surfaceMuted,
  border: palette.ink100,
  divider: palette.ink50,

  text: palette.ink900,
  textMuted: palette.ink500,
  textSubtle: palette.ink400,
  textOnPrimary: palette.white,
  textOnAccent: palette.ink900,
  // Text colours that sit directly on the indigo canvas (not inside a card).
  textOnBg: palette.white,
  textOnBgMuted: '#C7D2FE',
  textOnBgSubtle: '#A5B4FC',
  borderOnBg: 'rgba(255,255,255,0.14)',

  success: palette.green600,
  successSoft: palette.green50,
  danger: palette.red600,
  dangerSoft: palette.red50,
  info: palette.blue600,
  infoSoft: palette.blue50,
  warning: palette.amber500,
  warningSoft: palette.amber50,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const fontFamily = {
  // RN bundles a set of system fonts. Until we ship .ttf assets we use platform defaults
  // mapped to deliberate weights so the visual identity is consistent.
  heading: undefined as string | undefined,
  body: undefined as string | undefined,
  mono: undefined as string | undefined,
};

export const fontSize = {
  caption: 11,
  small: 13,
  body: 15,
  bodyLg: 16,
  subhead: 18,
  title: 22,
  display: 28,
  hero: 34,
};

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  fab: {
    shadowColor: palette.amber500,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const motion = {
  fast: 150,
  base: 220,
  slow: 320,
  spring: {damping: 16, stiffness: 220, mass: 1},
  springSoft: {damping: 22, stiffness: 180, mass: 1},
  springBouncy: {damping: 12, stiffness: 240, mass: 1},
};

export type AppTheme = {
  colors: typeof colors;
  spacing: typeof spacing;
  radii: typeof radii;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  shadows: typeof shadows;
  motion: typeof motion;
};

export const theme: AppTheme = {
  colors,
  spacing,
  radii,
  fontFamily,
  fontSize,
  fontWeight,
  shadows,
  motion,
};
