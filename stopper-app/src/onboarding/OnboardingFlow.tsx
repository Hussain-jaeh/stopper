import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingState, freshState } from './state';

import { SplashScreen } from './screens/SplashScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { HeroScreen } from './screens/HeroScreen';
import { OvercomeScreen } from './screens/OvercomeScreen';
import { WhyScreen } from './screens/WhyScreen';
import { DurationScreen } from './screens/DurationScreen';
import { FrequencyScreen } from './screens/FrequencyScreen';
import { TriggersScreen } from './screens/TriggersScreen';
import { EducationScreen } from './screens/EducationScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { FutureSelfScreen } from './screens/FutureSelfScreen';
import { CommitmentScreen } from './screens/CommitmentScreen';
import { DailyHabitsScreen } from './screens/DailyHabitsScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { AccountabilityScreen } from './screens/AccountabilityScreen';
import { SymptomsScreen } from './screens/SymptomsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AnalyzingScreen } from './screens/AnalyzingScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { FreedomScreen } from './screens/FreedomScreen';
import { StoriesScreen } from './screens/StoriesScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { PlanScreen } from './screens/PlanScreen';
import { StreakScreen } from './screens/StreakScreen';
import { FinalScreen } from './screens/FinalScreen';
import { SpendingStep, SpendingValue } from './screens/SpendingStep';

// Progress bar spans screens 3–16 (overcome → profile, 0-indexed)
const PROGRESS_START = 3;
const PROGRESS_END = 16;

function getProgress(step: number): number {
  if (step < PROGRESS_START || step > PROGRESS_END) return 0;
  return ((step - PROGRESS_START) / (PROGRESS_END - PROGRESS_START)) * 100;
}

interface OnboardingFlowProps {
  startStep?: number;
  onComplete?: (state: OnboardingState) => void;
  onSignIn?: () => void;
}

export function OnboardingFlow({ startStep, onComplete, onSignIn }: OnboardingFlowProps) {
  const [step, setStep] = useState(startStep ?? 0);
  const [state, setStateRaw] = useState<OnboardingState>(freshState);
  const setState = useCallback((patch: Partial<OnboardingState>) => {
    setStateRaw(prev => ({ ...prev, ...patch }));
  }, []);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));
  const pct = getProgress(step);

  const screens: Record<number, React.ReactNode> = {
    0: <SplashScreen onNext={next} />,
    1: <WelcomeScreen onNext={next} onSignIn={onSignIn} />,
    2: <HeroScreen onNext={next} />,
    3: <OvercomeScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    4: <WhyScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    5: <DurationScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    6: <FrequencyScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    7: <TriggersScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    8: <EducationScreen onNext={next} />,
    9: <GoalsScreen onBack={back} onNext={next} state={state} setState={setState} />,
    10: <FutureSelfScreen onBack={back} onNext={next} state={state} />,
    11: <CommitmentScreen onBack={back} onNext={next} state={state} setState={setState} />,
    12: <DailyHabitsScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    13: <ActivityScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    14: <AccountabilityScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    15: <SymptomsScreen onBack={back} onNext={next} state={state} setState={setState} />,
    16: <ProfileScreen pct={pct} onBack={back} onNext={next} state={state} setState={setState} />,
    17: (
      <SpendingStep
        value={{ amount: state.spendingAmount, frequency: state.spendingFrequency || 'monthly', currency: state.spendingCurrency }}
        onChange={(v: SpendingValue) => setState({ spendingAmount: v.amount, spendingFrequency: v.frequency, spendingCurrency: v.currency })}
        onNext={() => { setState({ trackingEnabled: true }); next(); }}
        onSkip={() => { setState({ trackingEnabled: false }); next(); }}
      />
    ),
    18: <AnalyzingScreen onNext={next} state={state} />,
    19: <AnalysisScreen onBack={back} onNext={next} state={state} />,
    20: <FreedomScreen onBack={back} onNext={next} />,
    21: <StoriesScreen onBack={back} onNext={next} />,
    22: <NotificationsScreen onBack={back} onNext={next} setState={setState} />,
    23: <PlanScreen onBack={back} onNext={next} state={state} />,
    24: <StreakScreen onBack={back} onNext={next} state={state} />,
    25: (
      <FinalScreen
        state={state}
        onFinish={() => {
          if (onComplete) onComplete(state);
          else { setStep(0); setStateRaw(freshState()); }
        }}
      />
    ),
  };

  return (
    <View style={styles.fill}>
      {screens[step] ?? screens[0]}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
