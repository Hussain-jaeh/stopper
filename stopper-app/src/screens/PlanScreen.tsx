import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Anchor, CalendarDays, Target, Flame, Trophy, Milestone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../../convex/_generated/api';
import { DashboardSkeleton } from '../components/dashboard/states';
import { colors } from '../constants/colors';
import { spacing, radius } from '../constants/spacing';
import { type } from '../constants/typography';

function InfoCard({ Icon, label, value, tint, index }: {
  Icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: string;
  tint: string;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(500)}
      style={[styles.card, { borderColor: `${tint}28` }]}>
      <View style={[styles.cardIcon, { backgroundColor: `${tint}1A` }]}>
        <Icon size={20} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </Animated.View>
  );
}

export function PlanScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const plan = useQuery(api.account.getPlan);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}>
          <ChevronLeft size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>My plan & goals</Text>
        <View style={{ width: 38 }} />
      </View>

      {plan === undefined ? (
        <ScrollView contentContainerStyle={styles.content}><DashboardSkeleton /></ScrollView>
      ) : plan === null ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No plan found. Complete onboarding to set up your recovery plan.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 48 }]}
          showsVerticalScrollIndicator={false}>

          {/* Progress toward next milestone */}
          <Animated.View entering={FadeInDown.delay(0).duration(550)}>
            <LinearGradient colors={['rgba(20,184,136,0.12)', 'rgba(20,184,136,0.04)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.milestoneCard}>
              <View style={styles.milestoneTop}>
                <Milestone size={18} color={colors.jade300} />
                <Text style={styles.milestoneEyebrow}>NEXT MILESTONE</Text>
              </View>
              <Text style={styles.milestoneDays}>{plan.nextMilestone} days</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {
                  width: `${Math.min(100, (plan.cleanDays / plan.nextMilestone) * 100)}%`
                }]} />
              </View>
              <Text style={styles.milestoneLabel}>
                {plan.daysToNextMilestone} day{plan.daysToNextMilestone === 1 ? '' : 's'} to go · {plan.cleanDays} so far
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Current streak', value: `${plan.cleanDays}d`, tint: colors.coral500 },
              { label: 'Best streak',    value: `${plan.bestStreak}d`, tint: colors.gold },
            ].map(({ label, value, tint }, i) => (
              <Animated.View key={label} entering={FadeInDown.delay((i + 1) * 70).duration(500)}
                style={[styles.statCard, { borderColor: `${tint}28` }]}>
                <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Plan details */}
          <Text style={styles.sectionTitle}>Your recovery plan</Text>

          <InfoCard Icon={Flame} label="Working on" value={plan.addictionType} tint={colors.coral500} index={3} />
          <InfoCard Icon={CalendarDays} label="Quit date" value={plan.quitDate} tint={colors.jade500} index={4} />
          <InfoCard Icon={Anchor} label="Your why" value={plan.reasonForQuitting} tint="#9B6FE4" index={5} />
          {plan.goal ? (
            <InfoCard Icon={Target} label="Personal goal" value={plan.goal} tint={colors.gold} index={6} />
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screenPad, paddingVertical: 14 },
  back: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.h1, fontSize: 18, color: colors.white },
  content: { paddingHorizontal: spacing.screenPad, paddingTop: 8, gap: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { ...type.body, color: colors.textMuted, textAlign: 'center' },

  milestoneCard: { borderRadius: radius.card, padding: 20, borderWidth: 1, borderColor: 'rgba(20,184,136,0.2)', marginBottom: 4 },
  milestoneTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  milestoneEyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4, color: colors.jade300 },
  milestoneDays: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 38, color: colors.white, lineHeight: 44, marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: colors.surface3, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: colors.jade500, borderRadius: 2 },
  milestoneLabel: { fontSize: 13, color: colors.textMuted },

  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.surface1, borderWidth: 1, borderRadius: radius.card, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 26 },
  statLabel: { fontSize: 12, color: colors.textMuted },

  sectionTitle: { fontSize: 12.5, fontWeight: '700', letterSpacing: 1.4, color: colors.textFaint, textTransform: 'uppercase', marginTop: 8, marginBottom: 4 },

  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface1, borderWidth: 1, borderRadius: radius.card, padding: 16 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 3 },
  cardValue: { fontSize: 15.5, fontWeight: '500', color: colors.white },
});
