import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HandHeart, PenLine } from 'lucide-react-native';
import { CircleBack, PrimaryButton, DotTexture } from '../../components/primitives';
import { OnboardingState, firstName } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface CommitmentScreenProps {
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function CommitmentScreen({ onBack, onNext, state, setState }: CommitmentScreenProps) {
  const fn = firstName(state);
  const signed = !!state.committed;

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>
      <View style={[styles.content, { zIndex: 1 }]}>
        <HandHeart size={46} color={colors.jade400} />
        <Text style={styles.title}>Make your commitment</Text>
        <Text style={styles.subtitle}>
          Commitment turns intention into action. Sign your personal pledge to begin.
        </Text>
        <View style={[styles.pledgeCard, signed && styles.pledgeCardSigned]}>
          <Text style={styles.pledgeText}>
            "I'm choosing to take back control of my life, one day at a time."
          </Text>
          <View style={styles.signLine}>
            {signed ? (
              <Text style={styles.signature}>{fn || 'You'}</Text>
            ) : (
              <Text style={styles.tapHint}>Tap below to sign</Text>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.cta, { zIndex: 1 }]}>
        {signed ? (
          <PrimaryButton onPress={onNext}>I'm committed</PrimaryButton>
        ) : (
          <PrimaryButton
            onPress={() => setState({ committed: true })}
            icon={<PenLine size={20} color={colors.white} />}
          >
            Sign my commitment
          </PrimaryButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3, marginTop: 12, textAlign: 'center' },
  subtitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, textAlign: 'center', marginHorizontal: 18, marginTop: 12 },
  pledgeCard: {
    marginTop: 24, width: '100%', borderRadius: 20, padding: 26,
    paddingHorizontal: 22, backgroundColor: colors.surface1,
    borderWidth: 1.5, borderColor: colors.border,
  },
  pledgeCardSigned: { borderColor: colors.jade500 },
  pledgeText: { fontFamily: fonts.display, fontWeight: '700', fontSize: 19, color: colors.white, lineHeight: 26 },
  signLine: {
    marginTop: 22, borderTopWidth: 1, borderTopColor: colors.borderStrong,
    borderStyle: 'dashed', paddingTop: 16, minHeight: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  signature: { fontFamily: fonts.display, fontStyle: 'italic', fontWeight: '700', fontSize: 24, color: colors.jade300 },
  tapHint: { fontFamily: fonts.ui, fontSize: 13, color: colors.fgFaint },
  cta: { paddingTop: 10 },
});
