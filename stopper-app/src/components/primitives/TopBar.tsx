import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, useReducedMotion,
} from 'react-native-reanimated';
import { ArrowLeft, ChevronLeft } from 'lucide-react-native';
import { colors, fonts, radii, gradients } from '../../theme/tokens';

interface TopBarProps {
  pct: number;
  onBack?: () => void;
}

export function TopBar({ pct, onBack }: TopBarProps) {
  // Only 2 of 26 onboarding screens applied a safe-area inset, so on a 14 Pro
  // this row rendered underneath the Dynamic Island — the bar was clipped by
  // it and the back arrow's touch target sat in the status bar, which is why
  // Back appeared not to work. Applied here so every screen using a TopBar is
  // fixed at once.
  const insets = useSafeAreaInsets();
  const target = Math.min(100, Math.max(0, pct));
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(target);

  // The bar was jumping to its new width on every step. Travelling there is
  // the whole point of a progress bar — it's the only thing telling someone
  // sixteen questions in that the end is getting closer.
  useEffect(() => {
    width.value = reduceMotion
      ? target
      : withTiming(target, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [target, reduceMotion, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View style={[styles.row, { marginTop: insets.top }]}>
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={14}>
        <ArrowLeft size={22} color={colors.fgMuted} strokeWidth={2} />
      </Pressable>
      <View style={styles.trackBg}>
        <Animated.View style={[styles.trackFill, fill]}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
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
  const insets = useSafeAreaInsets();
  return (
    <Pressable onPress={onBack} style={[styles.circleBack, { marginTop: insets.top }]} hitSlop={12}>
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
