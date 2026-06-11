import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DotTexture, RingProgress } from '../../components/primitives';
import { OnboardingState, habitLabel, firstName } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface AnalyzingScreenProps {
  onNext: () => void;
  state: OnboardingState;
}

export function AnalyzingScreen({ onNext, state }: AnalyzingScreenProps) {
  const h = habitLabel(state);
  const fn = firstName(state);
  const [pct, setPct] = useState(0);

  const steps = [
    'Reviewing your answers…',
    `Analyzing your ${h} pattern…`,
    'Mapping your triggers…',
    fn ? `Building your plan, ${fn}…` : 'Building your plan…',
  ];

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + 2);
      setPct(v);
      if (v >= 100) {
        clearInterval(id);
        setTimeout(() => onNext(), 420);
      }
    }, 46);
    return () => clearInterval(id);
  }, []);

  const msg = steps[Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length))];

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={styles.content}>
        <RingProgress value={pct / 100} size={172} stroke={12} label={pct} sub="%" />
        <View style={styles.textBlock}>
          <Text style={styles.title}>Personalizing Stopper</Text>
          <Text style={styles.msg}>{msg}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', gap: 30, zIndex: 1 },
  textBlock: { alignItems: 'center' },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 24, color: colors.white, textAlign: 'center' },
  msg: { fontFamily: fonts.ui, fontSize: 16, color: colors.jade300, textAlign: 'center', marginTop: 12, minHeight: 22 },
});
