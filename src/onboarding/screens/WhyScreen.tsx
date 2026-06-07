import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Target, HeartPulse, Users, Sparkle, TrendingUp, Shield, Plus } from 'lucide-react-native';
import { TopBar, MultiRow, PrimaryButton } from '../../components/primitives';
import { REASONS } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

const ICONS: Record<string, React.ReactNode> = {
  focus: <Target size={21} color={colors.jade300} />,
  health: <HeartPulse size={21} color={colors.jade300} />,
  relationships: <Users size={21} color={colors.jade300} />,
  faith: <Sparkle size={21} color={colors.jade300} />,
  career: <TrendingUp size={21} color={colors.jade300} />,
  discipline: <Shield size={21} color={colors.jade300} />,
  other: <Plus size={21} color={colors.jade300} />,
};

interface WhyScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function WhyScreen({ pct, onBack, onNext, state, setState }: WhyScreenProps) {
  const sel = state.reasons;
  const toggle = (id: typeof REASONS[number]['id']) => {
    const next = new Set(sel);
    next.has(id) ? next.delete(id) : next.add(id);
    setState({ reasons: next });
  };

  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>Why are you starting?</Text>
        <Text style={styles.subtitle}>Your reasons become your anchor on hard days.</Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {REASONS.map(r => (
          <MultiRow
            key={r.id}
            icon={ICONS[r.id]}
            label={r.label}
            checked={sel.has(r.id)}
            onPress={() => toggle(r.id)}
          />
        ))}
      </ScrollView>
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext} disabled={sel.size === 0}>Continue</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  header: { paddingTop: 22 },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, marginTop: 12 },
  list: { flex: 1, marginTop: 20 },
  listContent: { gap: 10, paddingBottom: 8 },
  cta: { paddingTop: 10 },
});
