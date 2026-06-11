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

export function AnalysisScreen({ onBack, onNext, state }: AnalysisScreenProps) {
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
          <Text style={{ color: colors.white, fontWeight: '700' }}>strong dependence</Text>{' '}
          on {primaryHabit(state)}.
        </Text>
        <CompareBars you={68} avg={40} />
      </View>

      <View style={{ zIndex: 1 }}>
        <Text style={styles.highlight}>
          <Text style={{ color: colors.coral400, fontWeight: '700' }}>28% higher</Text> dependence than average.
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
