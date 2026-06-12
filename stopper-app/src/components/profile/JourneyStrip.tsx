import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Flame, Trophy, Medal, TrendingUp, LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';

type Props = { cleanDays: number; bestStreak: number; badges: number; rank: number; index?: number };

export function JourneyStrip({ cleanDays, bestStreak, badges, rank, index = 1 }: Props) {
  const items: { Icon: LucideIcon; label: string; value: string; tint: string }[] = [
    { Icon: Flame,      label: 'Day streak', value: `${cleanDays}`,  tint: colors.coral500 },
    { Icon: Trophy,     label: 'Best',        value: `${bestStreak}d`, tint: colors.gold },
    { Icon: Medal,      label: 'Badges',      value: `${badges}`,    tint: colors.jade500 },
    { Icon: TrendingUp, label: 'Rank',         value: `#${rank}`,     tint: '#2E7DD1' },
  ];
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.card}>
      {items.map(({ Icon, label, value, tint }, i) => (
        <View key={label} style={[styles.col, i > 0 && styles.divider]}>
          <Icon size={18} color={tint} />
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 16 },
  col: { flex: 1, alignItems: 'center', gap: 7 },
  divider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  value: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 19, color: colors.white },
  label: { fontSize: 11, color: colors.textMuted },
});
