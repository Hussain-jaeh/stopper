import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  EyeOff, Smartphone, Cigarette, Wine, Pill,
  Gamepad2, Hourglass, Cookie, Plus
} from 'lucide-react-native';
import { TopBar, MultiRow, PrimaryButton } from '../../components/primitives';
import { OVERCOME } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

const ICONS: Record<string, React.ReactNode> = {
  porn: <EyeOff size={21} color="#fff" />,
  social: <Smartphone size={21} color="#fff" />,
  smoking: <Cigarette size={21} color="#fff" />,
  alcohol: <Wine size={21} color="#fff" />,
  drugs: <Pill size={21} color="#fff" />,
  gaming: <Gamepad2 size={21} color="#fff" />,
  procrast: <Hourglass size={21} color="#fff" />,
  eating: <Cookie size={21} color="#fff" />,
  other: <Plus size={21} color="#fff" />,
};

interface OvercomeScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function OvercomeScreen({ pct, onBack, onNext, state, setState }: OvercomeScreenProps) {
  const sel = state.overcome;
  const toggle = (id: typeof OVERCOME[number]['id']) => {
    const next = new Set(sel);
    next.has(id) ? next.delete(id) : next.add(id);
    setState({ overcome: next });
  };

  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>What do you want to overcome?</Text>
        <Text style={styles.subtitle}>Choose one or more. You can change this anytime.</Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {OVERCOME.map(o => (
          <MultiRow
            key={o.id}
            icon={ICONS[o.id]}
            label={o.label}
            tint={o.tint}
            checked={sel.has(o.id)}
            onPress={() => toggle(o.id)}
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
