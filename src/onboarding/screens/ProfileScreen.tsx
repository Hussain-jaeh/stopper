import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TopBar, StopperTextInput, Chip, PrimaryButton } from '../../components/primitives';
import { AGES } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface ProfileScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function ProfileScreen({ pct, onBack, onNext, state, setState }: ProfileScreenProps) {
  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>Finally</Text>
        <Text style={styles.prompt}>A little more <Text style={{ color: colors.white, fontWeight: '700' }}>about you</Text></Text>
      </View>
      <View style={styles.form}>
        <StopperTextInput
          label="Name"
          value={state.name}
          onChangeText={v => setState({ name: v })}
          placeholder="Your name"
        />
        <View style={styles.ageBlock}>
          <Text style={styles.ageLabel}>Age</Text>
          <View style={styles.chips}>
            {AGES.map(a => (
              <Chip key={a} label={a} active={state.age === a} onPress={() => setState({ age: a })} />
            ))}
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext} icon={null} disabled={!state.name || !state.age}>
          Build my plan
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  header: { paddingTop: 26, alignItems: 'center' },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3, textAlign: 'center' },
  prompt: { fontFamily: fonts.ui, fontSize: 20, fontWeight: '500', color: colors.fgMuted, textAlign: 'center', marginTop: 18, lineHeight: 26 },
  form: { marginTop: 30, gap: 22 },
  ageLabel: { fontFamily: fonts.ui, fontSize: 15, color: colors.fgMuted, marginBottom: 10 },
  ageBlock: {},
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cta: { paddingTop: 12 },
});
