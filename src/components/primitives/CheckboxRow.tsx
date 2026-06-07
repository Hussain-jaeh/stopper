import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, radii } from '../../theme/tokens';

interface CheckboxRowProps {
  label: React.ReactNode;
  checked: boolean;
  onPress: () => void;
}

export function CheckboxRow({ label, checked, onPress }: CheckboxRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.circle, checked && styles.circleChecked]}>
        {checked && <View style={styles.dot} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    gap: 16,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderPill,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circleChecked: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  label: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: fontSizes.body,
    color: colors.white,
  },
});
