import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleBack, StreakCard, Sparkles, PrimaryButton, DotTexture } from '../../components/primitives';
import { OnboardingState, habitLabel, firstName } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface StreakScreenProps {
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
}

export function StreakScreen({ onBack, onNext, state }: StreakScreenProps) {
  const [reveal, setReveal] = useState(false);
  const h = habitLabel(state);
  const fn = firstName(state);

  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 80);
    return () => clearTimeout(t);
  }, []);

  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  return (
    <View style={styles.screen}>
      <DotTexture />
      {reveal && <Sparkles count={16} />}
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>
      <View style={[styles.content, { zIndex: 1 }]}>
        <Text style={styles.title}>Day zero{fn ? `, ${fn}` : ''}.</Text>
        <Text style={styles.subtitle}>
          Your <Text style={{ color: colors.jade300, fontWeight: '700' }}>{h}-free</Text> journey starts now.
        </Text>
        <StreakCard days={0} since={today} reveal={reveal} />
        <Text style={styles.hint}>Check in every day to grow your streak.</Text>
      </View>
      <View style={[styles.cta, { zIndex: 1 }]}>
        <PrimaryButton onPress={onNext}>Almost there</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center' },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3, textAlign: 'center' },
  subtitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, textAlign: 'center', marginTop: 10, marginBottom: 26 },
  hint: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, textAlign: 'center', marginTop: 28 },
  cta: { paddingTop: 12 },
});
