import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Sunrise, Flame, CalendarCheck, Zap, Medal, Trophy, Crown, Gem, Lock, LucideIcon,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

export type Milestone = { id: string; day: number; label: string; Icon: LucideIcon };

export const MILESTONES: Milestone[] = [
  { id: 'd1',  day: 1,   label: 'First day',  Icon: Sunrise },
  { id: 'd3',  day: 3,   label: '3 days',     Icon: Flame },
  { id: 'd7',  day: 7,   label: 'One week',   Icon: CalendarCheck },
  { id: 'd14', day: 14,  label: 'Two weeks',  Icon: Zap },
  { id: 'd30', day: 30,  label: 'One month',  Icon: Medal },
  { id: 'd90', day: 90,  label: '90 days',    Icon: Trophy },
  { id: 'd180',day: 180, label: 'Half year',  Icon: Crown },
  { id: 'd365',day: 365, label: 'One year',   Icon: Gem },
];

export function AchievementsGrid({ cleanDays, index = 5 }: { cleanDays: number; index?: number }) {
  const earnedCount = MILESTONES.filter(m => cleanDays >= m.day).length;
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Milestones</Text>
        <Text style={styles.meta}>{earnedCount}/{MILESTONES.length} earned</Text>
      </View>
      <View style={styles.grid}>
        {MILESTONES.map(m => {
          const earned = cleanDays >= m.day;
          const Glyph = earned ? m.Icon : Lock;
          return (
            <View key={m.id} style={[styles.item, { opacity: earned ? 1 : 0.4 }]}>
              {earned ? (
                <LinearGradient colors={[colors.jade400, colors.jade700]} start={{ x: 0.38, y: 0.32 }} end={{ x: 1, y: 1 }} style={styles.badge}>
                  <Glyph size={23} color={colors.white} />
                </LinearGradient>
              ) : (
                <View style={[styles.badge, styles.badgeLocked]}>
                  <Glyph size={17} color={colors.textFaint} />
                </View>
              )}
              <Text style={[styles.label, { color: earned ? colors.white : colors.textFaint }]}>{m.label}</Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { ...type.cardTitle, color: colors.white },
  meta: { fontSize: 12.5, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { width: '25%', alignItems: 'center', gap: 7, marginBottom: 16 },
  badge: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  badgeLocked: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.borderStrong, borderStyle: 'dashed' },
  label: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
