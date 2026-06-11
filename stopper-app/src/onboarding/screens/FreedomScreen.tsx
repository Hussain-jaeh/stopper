import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleBack, FreedomGraph, PrimaryButton, DotTexture } from '../../components/primitives';
import { colors, fonts } from '../../theme/tokens';

interface FreedomScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export function FreedomScreen({ onBack, onNext }: FreedomScreenProps) {
  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>
      <View style={[styles.content, { zIndex: 1 }]}>
        <Text style={styles.title}>Your path to freedom</Text>
        <Text style={styles.subtitle}>With Stopper, recovery isn't just possible — it compounds.</Text>
        <FreedomGraph />
        <View style={styles.socialProof}>
          <Text style={styles.bigNum}>1,000,000+</Text>
          <Text style={styles.bigNumSub}>people are rebuilding their lives with Stopper</Text>
        </View>
      </View>
      <View style={[styles.cta, { zIndex: 1 }]}>
        <PrimaryButton onPress={onNext}>Continue</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  content: { flex: 1, justifyContent: 'center', gap: 8 },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3, textAlign: 'center' },
  subtitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, marginTop: 10, marginBottom: 22, textAlign: 'center' },
  socialProof: { alignItems: 'center', marginTop: 26 },
  bigNum: { fontFamily: fonts.display, fontWeight: '800', fontSize: 34, color: colors.white },
  bigNumSub: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.fgMuted, marginTop: 4, textAlign: 'center' },
  cta: { paddingTop: 10 },
});
