import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Brain, Heart, Smile, Zap, Target, Sparkles } from 'lucide-react-native';
import { CircleBack, GoalRow, PrimaryButton, DotTexture } from '../../components/primitives';
import { GOALS } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

const ICONS: Record<string, React.ReactNode> = {
  selfcontrol: <Brain size={21} color="#fff" />,
  relationships: <Heart size={21} color="#fff" />,
  mood: <Smile size={21} color="#fff" />,
  energy: <Zap size={21} color="#fff" />,
  focus: <Target size={21} color="#fff" />,
  confidence: <Sparkles size={21} color="#fff" />,
};

interface GoalsScreenProps {
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function GoalsScreen({ onBack, onNext, state, setState }: GoalsScreenProps) {
  const sel = state.goals;
  const toggle = (id: typeof GOALS[number]['id']) => {
    const next = new Set(sel);
    next.has(id) ? next.delete(id) : next.add(id);
    setState({ goals: next });
  };

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>
      <View style={[styles.header, { zIndex: 1 }]}>
        <Text style={styles.title}>Choose your goals</Text>
        <Text style={styles.subtitle}>Select what you want to track during your reset.</Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {GOALS.map(g => (
          <GoalRow
            key={g.id}
            icon={ICONS[g.id]}
            label={g.label}
            color={g.color}
            checked={sel.has(g.id)}
            onPress={() => toggle(g.id)}
          />
        ))}
      </ScrollView>
      <View style={[styles.cta, { zIndex: 1 }]}>
        <PrimaryButton onPress={onNext} disabled={sel.size === 0}>Track these goals</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  header: { paddingTop: 6 },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, marginTop: 12 },
  list: { flex: 1, marginTop: 20, zIndex: 1 },
  listContent: { gap: 11, paddingBottom: 8 },
  cta: { paddingTop: 10 },
});
