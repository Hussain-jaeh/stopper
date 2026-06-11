import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Zap, Cloud, User, Wind, Users, Moon, Plus } from 'lucide-react-native';
import { TopBar, MultiRow, PrimaryButton } from '../../components/primitives';
import { TRIGGERS } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

const ICONS: Record<string, React.ReactNode> = {
  stress: <Zap size={21} color={colors.jade300} />,
  boredom: <Cloud size={21} color={colors.jade300} />,
  loneliness: <User size={21} color={colors.jade300} />,
  anxiety: <Wind size={21} color={colors.jade300} />,
  social: <Users size={21} color={colors.jade300} />,
  latenights: <Moon size={21} color={colors.jade300} />,
  other: <Plus size={21} color={colors.jade300} />,
};

interface TriggersScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function TriggersScreen({ pct, onBack, onNext, state, setState }: TriggersScreenProps) {
  const sel = state.triggers;
  const toggle = (id: typeof TRIGGERS[number]['id']) => {
    const next = new Set(sel);
    next.has(id) ? next.delete(id) : next.add(id);
    setState({ triggers: next });
  };

  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>What triggers you most?</Text>
        <Text style={styles.subtitle}>We'll help you spot these moments before they hit.</Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {TRIGGERS.map(t => (
          <MultiRow
            key={t.id}
            icon={ICONS[t.id]}
            label={t.label}
            checked={sel.has(t.id)}
            onPress={() => toggle(t.id)}
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
