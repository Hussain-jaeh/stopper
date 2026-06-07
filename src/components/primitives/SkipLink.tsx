import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../../theme/tokens';

interface SkipLinkProps {
  children?: React.ReactNode;
  onPress?: () => void;
}

export function SkipLink({ children = 'Not now', onPress }: SkipLinkProps) {
  return (
    <Pressable onPress={onPress} style={styles.btn}>
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    alignSelf: 'center',
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.fgMuted,
  },
});
