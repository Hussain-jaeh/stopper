import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { colors, gradients } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

type Props = { current: number; milestone: number; index?: number };

export function ProgressCard({ current, milestone, index = 2 }: Props) {
  const pct = Math.min(100, Math.round((current / milestone) * 100));
  const remaining = Math.max(0, milestone - current);
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(pct, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value}%` as any }));

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.muted}>Next milestone</Text>
        <Text style={styles.count}>
          {current} <Text style={styles.countMuted}>/ {milestone} days</Text>
        </Text>
      </View>

      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: pct }}
      >
        <Animated.View style={[styles.fillWrap, fillStyle]}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} />
        </Animated.View>
      </View>

      <View style={styles.row}>
        <Text style={styles.pct}>{pct}% complete</Text>
        <Text style={styles.muted}>{remaining} days remaining</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 0 },
  muted: { ...type.subtitle, color: colors.textMuted },
  count: { ...type.cardTitle, color: colors.white },
  countMuted: { color: colors.textMuted, fontSize: 15 },
  track: { height: 12, borderRadius: radius.full, backgroundColor: colors.surface2, overflow: 'hidden', marginVertical: 14 },
  fillWrap: { height: '100%' },
  fill: { flex: 1, borderRadius: radius.full },
  pct: { ...type.label, color: colors.jade300, fontWeight: '700' },
});
