import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Bot, UserPlus, Users, Lock } from 'lucide-react-native';
import { TopBar, SegmentCard, PrimaryButton } from '../../components/primitives';
import { ACCOUNT } from '../data';
import { OnboardingState } from '../state';
import { colors, fonts } from '../../theme/tokens';

const ICONS_SEL: Record<string, React.ReactNode> = {
  ai: <Bot size={24} color="#fff" />,
  friend: <UserPlus size={24} color="#fff" />,
  community: <Users size={24} color="#fff" />,
  private: <Lock size={24} color="#fff" />,
};
const ICONS_UNSEL: Record<string, React.ReactNode> = {
  ai: <Bot size={24} color={colors.jade300} />,
  friend: <UserPlus size={24} color={colors.jade300} />,
  community: <Users size={24} color={colors.jade300} />,
  private: <Lock size={24} color={colors.jade300} />,
};

interface AccountabilityScreenProps {
  pct: number;
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function AccountabilityScreen({ pct, onBack, onNext, state, setState }: AccountabilityScreenProps) {
  return (
    <View style={styles.screen}>
      <TopBar pct={pct} onBack={onBack} />
      <View style={styles.header}>
        <Text style={styles.title}>How do you want support?</Text>
        <Text style={styles.subtitle}>Accountability makes you far more likely to succeed.</Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {ACCOUNT.map(a => (
          <SegmentCard
            key={a.id}
            icon={state.account === a.id ? ICONS_SEL[a.id] : ICONS_UNSEL[a.id]}
            title={a.title}
            sub={a.sub}
            selected={state.account === a.id}
            onPress={() => setState({ account: a.id })}
          />
        ))}
      </ScrollView>
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext} disabled={!state.account}>Continue</PrimaryButton>
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
  listContent: { gap: 12, paddingBottom: 8 },
  cta: { paddingTop: 10 },
});
