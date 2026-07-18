import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { savedTotal as calcSavedTotal, SpendingSettings } from '../lib/money';
import { ProgressHeader, SummaryStrip, InsightCard, Range } from '../components/progress/ProgressBits';
import { MilestoneRing } from '../components/progress/MilestoneRing';
import { CalendarHeatmap, CalendarData } from '../components/progress/CalendarHeatmap';
import { TrendChart } from '../components/progress/TrendChart';
import { AchievementsGrid, MILESTONES } from '../components/progress/AchievementsGrid';
import { DashboardSkeleton, EmptyState } from '../components/dashboard/states';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

type ProgressData = {
  cleanDays: number;
  bestStreak: number;
  successRate: number;
  trend: number[];
  calendar: CalendarData;
  insight: { title: string; body: string };
};

function nextMilestoneFor(days: number): number {
  const next = MILESTONES.find(m => m.day > days);
  return next ? next.day : MILESTONES[MILESTONES.length - 1].day;
}

export function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>('Month');
  const data = useQuery(api.progress.getProgress, { range }) as ProgressData | undefined | null;
  const recoveryProfile = useQuery(api.profiles.getProfile);

  if (data === undefined) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
        <DashboardSkeleton />
      </ScrollView>
    );
  }

  if (data === null) {
    return (
      <View style={[styles.screen, styles.fill]}>
        <EmptyState onStart={() => {}} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 96 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: spacing.md }}>
        <ProgressHeader range={range} setRange={setRange} index={0} />
        <MilestoneRing cleanDays={data.cleanDays} nextMilestone={nextMilestoneFor(data.cleanDays)} index={1} />
        <SummaryStrip cleanDays={data.cleanDays} bestStreak={data.bestStreak} successRate={data.successRate} index={2} />
        <CalendarHeatmap data={data.calendar} index={3} />
        <TrendChart trend={data.trend} index={4} />
        {(() => {
          if (recoveryProfile?.spendingAmount) {
            const settings: SpendingSettings = {
              spendingAmount: recoveryProfile.spendingAmount,
              spendingFrequency: recoveryProfile.spendingFrequency ?? 'monthly',
              currency: recoveryProfile.currency ?? 'USD',
              trackingEnabled: true,
            };
            return (
              <AchievementsGrid
                cleanDays={data.cleanDays}
                savedTotal={calcSavedTotal(settings, data.cleanDays)}
                currency={settings.currency}
                index={5}
              />
            );
          }
          return <AchievementsGrid cleanDays={data.cleanDays} index={5} />;
        })()}
        <InsightCard title={data.insight.title} body={data.insight.body} index={6} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { paddingHorizontal: spacing.screenPad },
});
