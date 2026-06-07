import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, radii } from '../../theme/tokens';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 100,
    height: 56,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderPill,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: 'transparent',
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.white,
  },
  labelActive: {
    fontWeight: '600',
  },
});
