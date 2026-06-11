import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, radii } from '../../theme/tokens';

interface AlertBannerProps {
  children: React.ReactNode;
}

export function AlertBanner({ children }: AlertBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.alert,
    borderRadius: radii.md,
    padding: 18,
  },
  text: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 22,
  },
});
