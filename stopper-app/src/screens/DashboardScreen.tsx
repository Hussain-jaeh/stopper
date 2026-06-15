import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StreakCard } from '../components/dashboard/StreakCard';
import { ProgressCard } from '../components/dashboard/ProgressCard';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { MotivationCard, QUOTES } from '../components/dashboard/MotivationCard';
import { CheckInCard } from '../components/dashboard/CheckInCard';
import { CheckInModal } from '../components/dashboard/CheckInModal';
import { DashboardSkeleton, EmptyState } from '../components/dashboard/states';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

type Props = {
  onStartOnboarding: () => void;
};

export function DashboardScreen({ onStartOnboarding }: Props) {
  const insets = useSafeAreaInsets();
  const data = useQuery(api.dashboard.getDashboard);
  const checkIn = useMutation(api.checkins.createCheckIn);

  const [refreshing, setRefreshing] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleCheckIn = useCallback(async (mood:
     string, cravingLevel: number, note?: string) => {
    await checkIn({ mood, cravingLevel, note });
  }, [checkIn]);

  const content = (() => {
    if (data === undefined) return <DashboardSkeleton />;
    if (data === null || data.profile === null) {
      return <EmptyState onStart={onStartOnboarding} />;
    }
    return (
      <View style={{ gap: spacing.gap + 6 }}>
        <DashboardHeader name={data.name ?? 'there'} avatarUri={data.avatarUri} index={0} />
        <StreakCard
          current={data.currentStreak}
          daysSinceQuit={data.daysSinceQuit}
          longest={data.longestStreak}
          addictionType={data.profile.addictionType}
          index={1}
        />
        <ProgressCard current={data.currentStreak} milestone={data.nextMilestone} index={2} />
        <CheckInCard
          done={data.todayCheckedIn}
          onCheckIn={() => setCheckInVisible(true)}
          index={3}
        />
        <StatsGrid
          longestStreak={data.longestStreak}
          cravingAverage={data.cravingAverage}
          totalCheckIns={data.totalCheckIns}
          totalRelapses={data.totalRelapses}
          index={4}
        />
        <MotivationCard quote={quote} index={5} />
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
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
