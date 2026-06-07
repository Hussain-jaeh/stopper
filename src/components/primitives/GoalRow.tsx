import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, fonts, fontSizes } from '../../theme/tokens';

interface GoalRowProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  checked: boolean;
  onPress: () => void;
}

export function GoalRow({ icon, label, color, checked, onPress }: GoalRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        checked
          ? { backgroundColor: `${color}38`, borderColor: color }
          : styles.rowUnsel,
      ]}
    >
      <View style={[styles.circle, { backgroundColor: color }]}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.check, checked && { borderColor: color, backgroundColor: color }]}>
        {checked && <Check size={13} color={colors.white} strokeWidth={3} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface1,
  },
  rowUnsel: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
  },
  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.white,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
