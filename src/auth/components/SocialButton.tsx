import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { AppleLogo, GoogleLogo } from './AuthProviderLogo';
import { colors, fonts, fontSizes, radii } from '../../theme/tokens';

interface SocialButtonProps {
  provider: 'apple' | 'google';
  label: string;
  onPress?: () => void;
  loading?: boolean;
}

/** White pill auth button with the provider's brand mark pinned left. */
export function SocialButton({ provider, label, onPress, loading }: SocialButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={loading} style={[styles.btn, loading && { opacity: 0.55 }]}>
      <View style={styles.logo}>
        {provider === 'apple' ? <AppleLogo size={20} /> : <GoogleLogo size={20} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    height: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
    left: 22,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
});
