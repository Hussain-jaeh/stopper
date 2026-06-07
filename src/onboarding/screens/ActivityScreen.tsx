import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Footprints, Activity, Dumbbell, ArrowUp, House, CircleSlash } from 'lucide-react-native';
import { TopBar, MultiRow, PrimaryButton } from '../../components/primitives';
import { ACTIVITIES } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

const ICONS: Record<string, React.ReactNode> = {
  walking: <Footprints size={21} color={colors.jade300} />,
  running: <Activity size={21} color={colors.jade300} />,
  gym: <Dumbbell size={21} color={colors.jade300} />,
  pushups: <ArrowUp size={21} color={colors.jade300} />,
  home: <House size={21} color={colors.jade300} />,
  none: <CircleSlash size={21} color={colors.jade300} />,
};

interface ActivityScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function ActivityScreen({ pct, onBack, onNext, state, setState }: ActivityScreenProps) {
  const sel = state.activities;
  const toggle = (id: typeof ACTIVITIES[number]['id']) => {
    const next = new Set(sel);
    next.has(id) ? next.delete(id) : next.add(id);
    setState({ activities: next });
  };

  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>How do you like to move?</Text>
        <Text style={styles.subtitle}>Movement is one of the fastest ways to redirect a craving.</Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {ACTIVITIES.map(a => (
          <MultiRow
            key={a.id}
            icon={ICONS[a.id]}
            label={a.label}
            checked={sel.has(a.id)}
            onPress={() => toggle(a.id)}
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
