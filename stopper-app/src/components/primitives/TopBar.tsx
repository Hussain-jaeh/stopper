import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronLeft } from 'lucide-react-native';
import { colors, fonts, radii, gradients } from '../../theme/tokens';

interface TopBarProps {
  pct: number;
  onBack?: () => void;
}

export function TopBar({ pct, onBack }: TopBarProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
        <ArrowLeft size={22} color={colors.fgMuted} strokeWidth={2} />
      </Pressable>
      <View style={styles.trackBg}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.trackFill, { width: `${Math.min(100, Math.max(0, pct))}%` }]}
        />
      </View>
      <View style={styles.langPill}>
        <Text style={styles.langText}>🇺🇸 EN</Text>
      </View>
    </View>
  );
}

interface CircleBackProps {
  onBack?: () => void;
}

export function CircleBack({ onBack }: CircleBackProps) {
  return (
    <Pressable onPress={onBack} style={styles.circleBack} hitSlop={8}>
      <ChevronLeft size={22} color={colors.white} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  backBtn: {
    padding: 4,
  },
  trackBg: {
    flex: 1,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  langPill: {
    height: 30,
    paddingHorizontal: 11,
    borderRadius: radii.full,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  circleBack: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
