import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

interface WordmarkProps {
  size?: number;
  color?: string;
}

export function Wordmark({ size = 26, color = colors.white }: WordmarkProps) {
  return (
    <Text style={[styles.text, { fontSize: size, color }]}>STOPPER</Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    letterSpacing: -1.2,
  },
});
