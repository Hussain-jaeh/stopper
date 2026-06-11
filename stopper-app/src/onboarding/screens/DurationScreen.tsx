import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TopBar, SelectRow, PrimaryButton } from '../../components/primitives';
import { DURATIONS } from '../data';
import { OnboardingState, primaryHabit } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface DurationScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function DurationScreen({ pct, onBack, onNext, state, setState }: DurationScreenProps) {
  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>How long has {primaryHabit(state)} been a challenge?</Text>
      </View>
      <View style={styles.list}>
        {DURATIONS.map(d => (
          <SelectRow
            key={d}
            label={d}
            selected={state.duration === d}
            onPress={() => setState({ duration: d })}
          />
        ))}
      </View>
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext} disabled={!state.duration}>Continue</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  header: { paddingTop: 22, alignItems: 'center' },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 26, color: colors.white, letterSpacing: -0.3, textAlign: 'center' },
  list: { flex: 1, gap: 12, marginTop: 28 },
  cta: { paddingTop: 10 },
});
