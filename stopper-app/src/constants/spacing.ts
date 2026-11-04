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
  hero: 20,
  // Buttons and selectable rows. Was 32 (fully round).
  pill: 14,
  full: 999,
} as const;

export const shadow = {
  cta: {
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  hero: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;
