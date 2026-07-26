import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StreakCard } from '../components/dashboard/StreakCard';
import { ProgressCard } from '../components/dashboard/ProgressCard';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { MotivationCard, QUOTES } from '../components/dashboard/MotivationCard';
import { CheckInCard } from '../components/dashboard/CheckInCard';
import { CheckInModal } from '../components/dashboard/CheckInModal';
import { RelapseModal } from '../components/dashboard/RelapseModal';
import { DashboardSkeleton, EmptyState } from '../components/dashboard/states';
import { FutureYouCard, Recording } from '../components/vault/FutureYouCard';
import { MilestoneRecordPrompt } from '../components/vault/VaultPrompts';
import { MoneySavedCard } from '../components/money/MoneySavedCard';
import { InviteCard } from '../components/share/InviteCard';
import { SpendingSettings, savedTotal, fmtMoney } from '../lib/money';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { RootStackParamList } from '../navigation/TabNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  onStartOnboarding: () => void;
};

export function DashboardScreen({ onStartOnboarding }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const data = useQuery(api.dashboard.getDashboard);
  const checkIn = useMutation(api.checkins.createCheckIn);
  const logRelapse = useMutation(api.relapses.logRelapse);
  const latestRecording = useQuery(api.vault.latestRecording);
  const claimMilestone = useMutation(api.vault.claimMilestonePrompt);

  const [refreshing, setRefreshing] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [relapseVisible, setRelapseVisible] = useState(false);
  const [milestoneDay, setMilestoneDay] = useState<number | null>(null);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleCheckIn = useCallback(async (mood: string, cravingLevel: number, note?: string) => {
    await checkIn({ mood, cravingLevel, note });
    const day = await claimMilestone();
    if (day) setTimeout(() => setMilestoneDay(day), 400);

  }, [checkIn, claimMilestone]);

  const handleRelapse = useCallback(async (trigger: string, note?: string) => {
    await logRelapse({ trigger, note });
  }, [logRelapse]);

  const content = (() => {
    if (data === undefined) return <DashboardSkeleton />;
    if (data === null || data.profile === null) {
      return <EmptyState onStart={onStartOnboarding} />;
    }
    const p = data.profile;
    const hasSpending = !!(p.spendingAmount);

    return (
      <View style={{ gap: spacing.gap + 6 }}>
        <DashboardHeader name={data.name ?? 'there'} avatarUri={data.avatarUri} index={0} />
        <StreakCard
          current={data.currentStreak}
          daysSinceQuit={data.daysSinceQuit}
          longest={data.longestStreak}
          addictionType={p.addictionType}
          index={1}
        />
        <ProgressCard current={data.currentStreak} milestone={data.nextMilestone} index={2} />
        <CheckInCard
          done={data.todayCheckedIn}
          onCheckIn={() => setCheckInVisible(true)}
          onRelapse={() => setRelapseVisible(true)}
          index={3}
        />
        <StatsGrid
          longestStreak={data.longestStreak}
          cravingAverage={data.cravingAverage}
          totalCheckIns={data.totalCheckIns}
          totalRelapses={data.totalRelapses}
          index={4}
        />
        <FutureYouCard
          latest={latestRecording ?? undefined}
          onRecord={() => navigation.navigate('VaultRecord')}
          onWatch={(r: Recording) => navigation.navigate('VaultPlay', { uri: r.videoUri ?? '', title: r.title, day: r.day })}
          onViewAll={() => navigation.navigate('Vault')}
          index={5}
        />
        {hasSpending && (
          <MoneySavedCard
            settings={{
              spendingAmount: p.spendingAmount!,
              spendingFrequency: p.spendingFrequency ?? 'monthly',
              currency: p.currency ?? 'USD',
              trackingEnabled: true,
            } as SpendingSettings}
            daysSinceQuit={data.daysSinceQuit}
            onViewInsights={() => navigation.navigate('MoneyInsights')}
            index={6}
          />
        )}
        <MotivationCard quote={quote} index={7} />
        <InviteCard inviteUrl={data.referralUrl ?? 'https://stopper.app'} />
      </View>
    );
  })();

  const centered = data === null || (data !== undefined && data.profile === null);

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          {
            paddingHorizontal: spacing.screenPad,
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 80,
          },
          centered && { flexGrow: 1, justifyContent: 'center' },
        ]}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.jade400} />
        }
      >
        {content}
      </ScrollView>

      {checkInVisible && (
        <CheckInModal
          visible={checkInVisible}
          onClose={() => setCheckInVisible(false)}
          onSubmit={handleCheckIn}
        />
      )}
      <RelapseModal
        visible={relapseVisible}
        onClose={() => setRelapseVisible(false)}
        onSubmit={handleRelapse}
      />
      <MilestoneRecordPrompt
        visible={milestoneDay !== null && !checkInVisible}
        day={milestoneDay ?? 0}
        onRecord={() => { setMilestoneDay(null); navigation.navigate('VaultRecord'); }}
        onLater={() => setMilestoneDay(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
