import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { CircleBack, AnimatedBar, PrimaryButton, DotTexture } from '../../components/primitives';
import { OnboardingState, habitLabel, firstName } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface PlanScreenProps {
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
}

export function PlanScreen({ onBack, onNext, state }: PlanScreenProps) {
  const h = habitLabel(state);
  const fn = firstName(state);
  const goalCount = state.goals.size;

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.eyebrow}>YOUR PERSONALIZED PLAN</Text>
          <Text style={styles.headline}>
            {fn ? `${fn}, here's your` : "Here's your"} path off{' '}
            <Text style={{ color: colors.jade400 }}>{h}</Text>.
          </Text>
        </View>

        <View style={styles.habitCard}>
          <View style={styles.habitIcon}>
            <Sprout size={24} color={colors.jade400} />
          </View>
          <View>
            <Text style={styles.habitTitle}>Quitting {h}</Text>
            <Text style={styles.habitSub}>
              {goalCount > 0
                ? `Built around the ${goalCount} goal${goalCount === 1 ? '' : 's'} you picked`
                : 'A plan tuned to your answers'}
            </Text>
          </View>
        </View>

        <View style={styles.barsSection}>
          <Text style={styles.barsLabel}>
            Projected improvement by <Text style={{ color: colors.white, fontWeight: '700' }}>day 90</Text>
          </Text>
          <View style={styles.bars}>
            <AnimatedBar label="Clarity" value={72} delay={0.30} />
            <AnimatedBar label="Energy" value={66} delay={0.42} />
            <AnimatedBar label="Mood & calm" value={78} delay={0.54} />
            <AnimatedBar label="Sleep" value={61} delay={0.66} />
          </View>
        </View>
      </ScrollView>
      <View style={[styles.cta, { zIndex: 1 }]}>
        <PrimaryButton onPress={onNext}>See my streak</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  list: { flex: 1, zIndex: 1 },
  listContent: { gap: 0, paddingTop: 12, paddingBottom: 8 },
  eyebrow: { fontFamily: fonts.ui, fontSize: 13, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', color: colors.jade300 },
  headline: { fontFamily: fonts.display, fontWeight: '800', fontSize: 27, color: colors.white, lineHeight: 32, marginTop: 10 },
  habitCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginTop: 20 },
  habitIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,184,136,0.14)', flexShrink: 0 },
  habitTitle: { fontFamily: fonts.ui, fontWeight: '700', fontSize: 16, color: colors.white },
  habitSub: { fontFamily: fonts.ui, fontSize: 13.5, color: colors.fgMuted, marginTop: 2 },
  barsSection: { marginTop: 24 },
  barsLabel: { fontFamily: fonts.ui, fontSize: 14, color: colors.fgMuted, marginBottom: 14 },
  bars: { gap: 16 },
  cta: { paddingTop: 14 },
});
