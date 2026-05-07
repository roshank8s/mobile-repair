// Single source of truth for design tokens. Do NOT hardcode values elsewhere.

export const palette = {
  indigo950: '#1E1B4B',
  indigo900: '#312E81',
  indigo700: '#4338CA',
  indigo50: '#EEF0FF',

  amber500: '#D97706',
  amber400: '#F59E0B',
  amber50: '#FEF3C7',

  green600: '#15803D',
  green50: '#DCFCE7',
  red600: '#B91C1C',
  red50: '#FEE2E2',
  blue600: '#1D4ED8',
  blue50: '#DBEAFE',

  ink900: '#111111',
  ink700: '#404040',
  ink500: '#737373',
  ink400: '#A3A3A3',
  ink300: '#D4D4D4',
  ink200: '#E5E5E5',
  ink100: '#F5F5F4',
  ink50: '#FAFAF9',

  surface: '#FAFAF9',
  surfaceRaised: '#FFFFFF',
  surfaceMuted: '#F5F5F4',

  white: '#FFFFFF',
  black: '#000000',
};

export const colors = {
  primary: palette.ink900,
  primaryRaised: palette.ink700,
  primaryMuted: palette.ink100,
  accent: palette.amber500,
  accentSoft: palette.amber50,

  brand: palette.indigo950,
  brandSoft: palette.indigo50,

  bg: palette.surface,
  bgRaised: palette.surfaceRaised,
  card: palette.surfaceRaised,
  cardMuted: palette.surfaceMuted,
  border: '#E7E5E4',
  divider: palette.ink100,

  text: palette.ink900,
  textMuted: palette.ink500,
  textSubtle: palette.ink400,
  textOnPrimary: palette.white,
  textOnAccent: palette.white,
  textOnBg: palette.ink900,
  textOnBgMuted: palette.ink500,
  textOnBgSubtle: palette.ink400,
  borderOnBg: '#E7E5E4',

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
  xxl: 24,
  pill: 999,
};

export const fontFamily = {
  heading: undefined as string | undefined,
  body: undefined as string | undefined,
  mono: undefined as string | undefined,
};

export const fontSize = {
  caption: 12,
  small: 13,
  body: 15,
  bodyLg: 16,
  subhead: 18,
  title: 22,
  display: 32,
  hero: 44,
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
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
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
