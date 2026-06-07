import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, fonts, fontSizes, radii } from '../../theme/tokens';

interface MultiRowProps {
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  checked: boolean;
  onPress: () => void;
  tint?: string;
}

export function MultiRow({ icon, label, sub, checked, onPress, tint }: MultiRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        checked && styles.rowChecked,
      ]}
    >
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: tint || 'rgba(255,255,255,0.06)' }]}>
          {icon}
        </View>
      )}
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      <View style={[styles.check, checked && styles.checkActive]}>
        {checked && <Check size={14} color={colors.ink900} strokeWidth={3} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 62,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
    backgroundColor: colors.surface1,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rowChecked: {
    backgroundColor: 'rgba(20,184,136,0.12)',
    borderColor: colors.jade500,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.white,
  },
  sub: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.label,
    color: colors.fgMuted,
    marginTop: 2,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkActive: {
    borderColor: colors.jade500,
    backgroundColor: colors.jade500,
  },
});
