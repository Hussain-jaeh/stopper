import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleBack, CompareBars, PrimaryButton, DotTexture } from '../../components/primitives';
import { OnboardingState, primaryHabit } from '../state';
import { colors, fonts, gradients } from '../../theme/tokens';

interface AnalysisScreenProps {
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
}

// Average dependence score per habit type (%).
const HABIT_AVG: Record<string, number> = {
  alcohol: 42, drugs: 48, smoking: 38, porn: 36,
  social: 30, gaming: 32, procrast: 26, eating: 30, other: 34,
};

function computeScore(state: OnboardingState): { score: number; avg: number; level: string } {
  const freqPts: Record<string, number> = {
    'Multiple times a day': 35,
    'About once a day': 25,
    'A few times a week': 14,
    'Once a week or less': 7,
  };
  const durPts: Record<string, number> = {
    'More than 5 years': 30,
    '3–5 years': 23,
    '1–3 years': 15,
    '6–12 months': 8,
    'Less than 6 months': 4,
  };

  const fPts = freqPts[state.freq] ?? 18;
  const dPts = durPts[state.duration] ?? 12;
  const tPts = Math.min(20, Math.round((state.triggers.size / 7) * 20));
  const sPts = Math.min(15, Math.round((state.symptoms.size / 7) * 15));

  const raw = fPts + dPts + tPts + sPts;
  const score = Math.max(20, Math.min(95, raw));

  const habit = [...state.overcome][0] ?? 'other';
  const avg = HABIT_AVG[habit] ?? 34;

  const level =
    score >= 75 ? 'severe dependence' :
    score >= 60 ? 'strong dependence' :
    score >= 40 ? 'moderate dependence' : 'mild dependence';

  return { score, avg, level };
}

export function AnalysisScreen({ onBack, onNext, state }: AnalysisScreenProps) {
  const { score, avg, level } = computeScore(state);
  const diff = score - avg;
  const abovAvg = diff > 0;

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>
      <View style={[styles.header, { zIndex: 1 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Analysis complete</Text>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.checkCircle}>
            <Check size={17} color={colors.white} strokeWidth={3} />
          </LinearGradient>
        </View>
        <Text style={styles.subtitle}>Here's what your answers tell us.</Text>
      </View>

      <View style={[styles.card, { zIndex: 1 }]}>
        <Text style={styles.cardText}>
          Your responses indicate a{' '}
          <Text style={{ color: colors.white, fontWeight: '700' }}>{level}</Text>{' '}
          on {primaryHabit(state)}.
        </Text>
        <CompareBars you={score} avg={avg} />
      </View>

      <View style={{ zIndex: 1 }}>
        <Text style={styles.highlight}>
          {abovAvg ? (
            <>
              <Text style={{ color: colors.coral400, fontWeight: '700' }}>{diff}% higher</Text>
              {' '}dependence than average.
            </>
          ) : diff < 0 ? (
            <>
              <Text style={{ color: colors.jade400, fontWeight: '700' }}>{Math.abs(diff)}% lower</Text>
              {' '}dependence than average.
            </>
          ) : (
            <Text style={{ color: colors.jade400, fontWeight: '700' }}>At average dependence level.</Text>
          )}
        </Text>
        <Text style={styles.disclaimer}>This is an indication only, not a medical diagnosis.</Text>
      </View>

      <View style={{ flex: 1 }} />
      <View style={[styles.cta, { zIndex: 1 }]}>
        <PrimaryButton onPress={onNext}>Check my symptoms</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  header: { paddingTop: 6, alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3 },
  checkCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, marginTop: 12 },
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 24, paddingHorizontal: 18, marginTop: 16, marginBottom: 8 },
  cardText: { textAlign: 'center', fontFamily: fonts.ui, fontSize: 15.5, color: colors.fgMuted, marginBottom: 20, lineHeight: 22 },
  highlight: { textAlign: 'center', fontFamily: fonts.ui, fontSize: 15, color: colors.white, marginTop: 20 },
  disclaimer: { textAlign: 'center', fontFamily: fonts.ui, fontSize: 12, color: colors.fgFaint, marginTop: 16, marginHorizontal: 16, lineHeight: 17 },
  cta: { paddingTop: 10 },
});
