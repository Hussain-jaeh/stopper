import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Flame, Trophy, Target, Lightbulb, Activity, CircleCheckBig, RotateCcw, LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

export type Range = 'Week' | 'Month' | 'Year';

export function ProgressHeader({ range, setRange, index = 0 }: { range: Range; setRange: (r: Range) => void; index?: number }) {
  const ranges: Range[] = ['Week', 'Month', 'Year'];
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)}>
      <Text style={styles.h1}>Your progress</Text>
      <Text style={styles.sub}>Every clean day is a win worth seeing.</Text>
      <View style={styles.segment} accessibilityRole="tablist">
        {ranges.map(r => {
          const on = r === range;
          return (
            <Pressable key={r} onPress={() => setRange(r)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={styles.segItem}>
              {on ? <View style={[StyleSheet.absoluteFill, styles.segOn]} /> : null}
              <Text style={[styles.segTxt, { color: on ? colors.onAccent : colors.textMuted }]}>{r}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

type StatItem = { Icon: LucideIcon; label: string; value: string; tint: string };
export function SummaryStrip({
  cleanDays, bestStreak, successRate, cravingAverage, totalCheckIns, totalRelapses, index = 2,
}: {
  cleanDays: number;
  bestStreak: number;
  successRate: number;
  cravingAverage: number;
  totalCheckIns: number;
  totalRelapses: number;
  index?: number;
}) {
  // Six tiles, wrapping three to a row. The bottom three moved here when the
  // dashboard grid was removed — they existed nowhere else in the app.
  const items: StatItem[] = [
    { Icon: Flame, label: 'Current', value: `${cleanDays}d`, tint: colors.coral500 },
    { Icon: Trophy, label: 'Best', value: `${bestStreak}d`, tint: colors.gold },
    { Icon: Target, label: 'Success', value: `${successRate}%`, tint: colors.jade500 },
    { Icon: Activity, label: 'Avg. craving', value: cravingAverage.toFixed(1), tint: colors.coral400 },
    { Icon: CircleCheckBig, label: 'Check-ins', value: `${totalCheckIns}`, tint: colors.jade500 },
    { Icon: RotateCcw, label: 'Relapses', value: `${totalRelapses}`, tint: colors.textMuted },
  ];
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.strip}>
      {items.map(({ Icon, label, value, tint }) => (
        <View key={label} style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: tint + '29' }]}><Icon size={17} color={tint} /></View>
          <Text style={styles.statVal}>{value}</Text>
          <Text style={styles.statLbl}>{label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

export function InsightCard({ title, body, index = 6 }: { title: string; body: string; index?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)}>
      <LinearGradient colors={['rgba(20,184,136,0.10)', 'rgba(46,125,209,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.insight}>
        <Lightbulb size={22} color={colors.jade300} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.insightTitle}>{title}</Text>
          <Text style={styles.insightBody}>{body}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  h1: { ...type.h1, color: colors.white },
  sub: { ...type.label, color: colors.textMuted, marginTop: 6 },
  segment: { flexDirection: 'row', gap: 5, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 4, marginTop: 18 },
  segItem: { flex: 1, height: 38, borderRadius: 11, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.jade500, borderRadius: 11 },
  segTxt: { fontSize: 13, fontWeight: '700' },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flexBasis: '30%', flexGrow: 1, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 14, gap: 8, alignItems: 'flex-start' },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { ...type.h1, fontSize: 20, color: colors.white },
  statLbl: { fontSize: 12, color: colors.textMuted },
  insight: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', padding: 18, borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(20,184,136,0.22)' },
  insightTitle: { ...type.body, fontWeight: '700', color: colors.white, marginBottom: 4 },
  insightBody: { fontSize: 13.5, color: colors.textMuted, lineHeight: 19 },
});
