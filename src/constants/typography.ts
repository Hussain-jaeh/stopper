export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  ui: 'PlusJakartaSans_400Regular',
  uiMedium: 'PlusJakartaSans_500Medium',
  uiSemibold: 'PlusJakartaSans_600SemiBold',
  uiBold: 'PlusJakartaSans_700Bold',
} as const;

export const type = {
  display:   { fontFamily: fonts.display,    fontSize: 32, letterSpacing: -0.5 },
  h1:        { fontFamily: fonts.display,    fontSize: 27, letterSpacing: -0.3 },
  cardTitle: { fontFamily: fonts.displayBold,fontSize: 18 },
  statValue: { fontFamily: fonts.display,    fontSize: 24 },
  subtitle:  { fontFamily: fonts.ui,         fontSize: 15 },
  body:      { fontFamily: fonts.ui,         fontSize: 16 },
  button:    { fontFamily: fonts.uiSemibold, fontSize: 17 },
  label:     { fontFamily: fonts.ui,         fontSize: 13 },
  eyebrow:   { fontFamily: fonts.uiSemibold, fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase' as const },
} as const;
