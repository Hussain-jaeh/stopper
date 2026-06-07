import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { colors, fonts, fontSizes, radii, gradients, shadows } from '../../theme/tokens';

interface SelectRowProps {
  label: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectRow({ label, sub, selected, onPress }: SelectRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      {selected ? (
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.row, shadows.glowCta]}
        >
          <RowContent label={label} sub={sub} selected />
        </LinearGradient>
      ) : (
        <View style={[styles.row, styles.rowUnsel]}>
          <RowContent label={label} sub={sub} selected={false} />
        </View>
      )}
    </Pressable>
  );
}

function RowContent({ label, sub, selected }: { label: string; sub?: string; selected: boolean }) {
  return (
    <>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, selected && styles.labelBold]}>{label}</Text>
        {sub ? (
          <Text style={[styles.sub, selected && styles.subSelected]}>{sub}</Text>
        ) : null}
      </View>
      {selected && <Check size={20} color={colors.white} strokeWidth={2.6} />}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  row: {
    minHeight: 58,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowUnsel: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderPill,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.white,
  },
  labelBold: {
    fontWeight: '700',
  },
  sub: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.label,
    color: colors.fgMuted,
    marginTop: 2,
  },
  subSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
});
