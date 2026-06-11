import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sunrise, Sun, Moon } from 'lucide-react-native';
import { TopBar, SegmentCard, PrimaryButton } from '../../components/primitives';
import { TIMES } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

const ICONS: Record<string, React.ReactNode> = {
  morning: <Sunrise size={24} color="#fff" />,
  midday: <Sun size={24} color="#fff" />,
  evening: <Moon size={24} color="#fff" />,
};

const UNSEL_ICONS: Record<string, React.ReactNode> = {
  morning: <Sunrise size={24} color={colors.jade300} />,
  midday: <Sun size={24} color={colors.jade300} />,
  evening: <Moon size={24} color={colors.jade300} />,
};

interface DailyHabitsScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function DailyHabitsScreen({ pct, onBack, onNext, state, setState }: DailyHabitsScreenProps) {
  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>When will you check in?</Text>
        <Text style={styles.subtitle}>A daily check-in keeps your streak alive. Pick a time that sticks.</Text>
      </View>
      <View style={styles.list}>
        {TIMES.map(t => (
          <SegmentCard
            key={t.id}
            icon={state.checkin === t.id ? ICONS[t.id] : UNSEL_ICONS[t.id]}
            title={t.label}
            sub={t.sub}
            selected={state.checkin === t.id}
            onPress={() => setState({ checkin: t.id })}
          />
        ))}
      </View>
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext} disabled={!state.checkin}>Continue</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  header: { paddingTop: 22 },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, marginTop: 12 },
  list: { flex: 1, gap: 12, marginTop: 24 },
  cta: { paddingTop: 10 },
});
