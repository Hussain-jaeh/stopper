import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
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
import { AccountPrompt } from '../components/account/AccountPrompt';
import { useGuestUpgrade } from '../auth/GuestUpgrade';
import { MoneySavedCard } from '../components/money/MoneySavedCard';
import { InviteCard } from '../components/share/InviteCard';
import { SpendingSettings, savedTotal, fmtMoney } from '../lib/money';
import { ShareData, isShareMilestone } from '../lib/shareCard';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { RootStackParamList } from '../navigation/TabNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  onStartOnboarding: () => void;
};

/**
 * Streak days that offer an account. Deliberately disjoint from the vault
 * milestones (7/30/90/365) — on those days the vault prompt takes the moment,
 * so reusing them would mean this never fires. Two weeks is the first point
 * where someone has enough history to actually mind losing it.
 */
const MILESTONE_DAYS = [14, 60, 180];

export function DashboardScreen({ onStartOnboarding }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const data = useQuery(api.dashboard.getDashboard);
  const checkIn = useMutation(api.checkins.createCheckIn);
  const logRelapse = useMutation(api.relapses.logRelapse);
  const latestRecording = useQuery(api.vault.latestRecording);
  const claimMilestone = useMutation(api.vault.claimMilestonePrompt);
  const claimAccountPrompt = useMutation(api.guest.claimAccountPrompt);
  const markShareMilestone = useMutation(api.profiles.markShareMilestoneCelebrated);
  const { startUpgrade } = useGuestUpgrade();

  const [refreshing, setRefreshing] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [relapseVisible, setRelapseVisible] = useState(false);
  const [milestoneDay, setMilestoneDay] = useState<number | null>(null);
  const [accountPromptDay, setAccountPromptDay] = useState<number | null>(null);
  // Guards a double-fire while the mutation is in flight — the query hasn't
  // re-run with the new lastCelebratedShareDay yet, so the effect would
  // otherwise trip a second time on the next render.
  const celebrating = useRef(false);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  /** The payload both share entry points hand to the share screens. */
  const shareData: ShareData | null = useMemo(() => {
    if (!data?.profile) return null;
    const p = data.profile;
    const currency = p.currency ?? 'USD';
    const money = p.spendingAmount
      ? fmtMoney(savedTotal({
          spendingAmount: p.spendingAmount,
          spendingFrequency: p.spendingFrequency ?? 'monthly',
          currency,
          trackingEnabled: true,
        } as SpendingSettings, data.daysSinceQuit), currency)
      : fmtMoney(0, currency);
    return {
      days: data.currentStreak,
      longest: data.longestStreak,
      money,
      cleanPct: data.daysSinceQuit > 0
        ? Math.round(((data.daysSinceQuit - data.totalRelapses) / data.daysSinceQuit) * 100)
        : 100,
      resisted: p.resistedUrges ?? 0,
      habit: p.addictionType,
    };
  }, [data]);

  const openShare = useCallback(() => {
    if (!shareData) return;
    navigation.navigate('ShareSheet', { ...shareData, shareUrl: data?.referralUrl });
  }, [navigation, shareData, data?.referralUrl]);

  /**
   * Auto-celebration. Fires once per milestone day: the server records the day
   * and returns null if it has already been celebrated, so a reinstall or a
   * second device can't replay it. Held back while any other sheet is up —
   * a full-screen takeover landing on top of the check-in modal is the kind
   * of thing that makes people close the app.
   */
  useEffect(() => {
    const day = data?.currentStreak ?? 0;
    if (!shareData || day <= 0 || !isShareMilestone(day)) return;
    if (data?.lastCelebratedShareDay === day) return;
    if (celebrating.current) return;
    if (checkInVisible || relapseVisible || milestoneDay !== null || accountPromptDay !== null) return;
    // Only when Home is actually on screen — the tab stays mounted in the
    // background, and a full-screen takeover fired from another tab would
    // come out of nowhere.
    if (!isFocused) return;

    celebrating.current = true;
    (async () => {
      try {
        const claimed = await markShareMilestone({ day });
        if (claimed !== null) {
          navigation.navigate('MilestoneCelebration', { ...shareData, shareUrl: data?.referralUrl });
        }
      } catch {} finally {
        celebrating.current = false;
      }
    })();
  }, [data?.currentStreak, data?.lastCelebratedShareDay, data?.referralUrl, shareData,
      checkInVisible, relapseVisible, milestoneDay, accountPromptDay, markShareMilestone, navigation, isFocused]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleCheckIn = useCallback(async (mood: string, cravingLevel: number, note?: string) => {
    await checkIn({ mood, cravingLevel, note });
    const day = await claimMilestone();
    if (day) {
      setTimeout(() => setMilestoneDay(day), 400);
      return;
    }

    // Only when the vault prompt hasn't taken this moment — two sheets stacked
    // on one check-in is nagging, which is the thing we're avoiding. The claim
    // is made only here, where it can actually be shown, so a skipped occasion
    // isn't burnt and the offer waits for the next milestone.
    const streak = data?.currentStreak ?? 0;
    if (streak > 0 && MILESTONE_DAYS.includes(streak)) {
      try {
        if (await claimAccountPrompt({ prompt: 'streak-milestone' })) {
          setTimeout(() => setAccountPromptDay(streak), 400);
        }
      } catch {}
    }
  }, [checkIn, claimMilestone, claimAccountPrompt, data?.currentStreak]);

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
        <DashboardHeader
          name={data.name ?? 'there'}
          avatarUri={data.avatarUri}
          onShare={shareData ? openShare : undefined}
          index={0}
        />
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
          onWatch={(r: Recording) => navigation.navigate('VaultPlay', { recordingId: r.id, title: r.title, day: r.day })}
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
      <AccountPrompt
        visible={accountPromptDay !== null && !checkInVisible}
        promptId="streak-milestone"
        day={accountPromptDay ?? undefined}
        onCreateAccount={() => { setAccountPromptDay(null); startUpgrade(); }}
        onDismiss={() => setAccountPromptDay(null)}
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
