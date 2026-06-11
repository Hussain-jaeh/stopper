export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPad: 20,
  gap: 12,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  card: 20,
  hero: 26,
  pill: 32,
  full: 999,
} as const;

export const shadow = {
  cta: {
    shadowColor: '#14B888',
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  hero: {
    shadowColor: '#0B6B4D',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
} as const;
