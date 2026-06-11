import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TopBar, SelectRow, PrimaryButton } from '../../components/primitives';
import { FREQS } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface FrequencyScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function FrequencyScreen({ pct, onBack, onNext, state, setState }: FrequencyScreenProps) {
  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>How often does it affect you?</Text>
      </View>
      <View style={styles.list}>
        {FREQS.map(f => (
          <SelectRow
            key={f}
            label={f}
            selected={state.freq === f}
            onPress={() => setState({ freq: f })}
          />
        ))}
      </View>
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext} disabled={!state.freq}>Continue</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  header: { paddingTop: 22, alignItems: 'center' },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3, textAlign: 'center' },
  list: { flex: 1, gap: 12, marginTop: 28 },
  cta: { paddingTop: 10 },
});
