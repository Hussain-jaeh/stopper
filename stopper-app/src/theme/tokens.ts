export const colors = {
  // Raw palette
  black: '#0D0D0D',
  surface1: '#1A1A1A',
  surface2: '#1E1E1E',
  surface3: '#242424',

  jade700: '#0C6B4E',
  jade600: '#0F9468',
  jade500: '#14B888',
  jade400: '#2DD4A0',
  jade300: '#6FE9C6',

  coral500: '#FF6B4A',
  coral400: '#FF8A6B',
  orange500: '#F2622E',

  ink900: '#04201A',
  ink800: '#073029',

  white: '#FFFFFF',
  gray100: '#E6E6E6',
  gray400: '#8A8A8A',
  gray600: '#5A5A5A',

  meshTeal: '#2BB6C4',
  meshBlue: '#2E7DD1',
  meshOrange: '#E0581F',
  meshYellow: '#F2B23E',

  // Semantic
  bg: '#0D0D0D',
  bgCard: '#1A1A1A',
  bgPill: '#1E1E1E',
  bgPillHover: '#242424',

  fg: '#FFFFFF',
  fgMuted: '#8A8A8A',
  fgFaint: '#5A5A5A',

  accent: '#14B888',
  accentHi: '#2DD4A0',
  accentDeep: '#0C6B4E',
  secondary: '#FF6B4A',
  alert: '#F2622E',

  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',
  borderPill: 'rgba(255,255,255,0.05)',

  accentGlow: 'rgba(20,184,136,0.42)',
  accentGlowSoft: 'rgba(20,184,136,0.18)',
} as const;

export const gradients = {
  primary: ['#14B888', '#2DD4A0'] as const,        // 135deg
  splash: ['#11A074', '#0B6B4D', '#053A2B'] as const,
  welcome: ['#0B4A3A', '#07332A', '#04201A'] as const,
  coral: ['#FF6B4A', '#FF8A6B'] as const,
} as const;

export const fonts = {
  display: 'BricolageGrotesque',
  ui: 'PlusJakartaSans',
} as const;

export const fontSizes = {
  display: 32,
  h1: 28,
  question: 22,
  bodyLg: 18,
  body: 16,
  button: 17,
  label: 13,
  micro: 11,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extra: '800' as const,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
  pill: 32,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPad: 20,
  gapElem: 12,
  gapSection: 32,
} as const;

export const shadows = {
  glowCta: {
    shadowColor: '#14B888',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.42,
    shadowRadius: 20,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
} as const;
