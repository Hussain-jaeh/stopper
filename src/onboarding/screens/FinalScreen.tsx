import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { Wordmark, Sparkles } from '../../components/primitives';
import { OnboardingState, firstName } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface FinalScreenProps {
  onFinish: () => void;
  state: OnboardingState;
}

export function FinalScreen({ onFinish, state }: FinalScreenProps) {
  const fn = firstName(state);

  return (
    <LinearGradient
      colors={['#11A074', '#0B6B4D', '#053A2B']}
      locations={[0, 0.46, 1]}
      style={styles.fill}
    >
      <Sparkles count={18} />
      <View style={styles.inner}>
        <View style={[styles.content, { zIndex: 1 }]}>
          <Wordmark size={30} />
          <Text style={styles.headline}>You're ready{fn ? `, ${fn}` : ''}.</Text>
          <Text style={styles.subtitle}>
            Your personalized plan is built. Day one starts the moment you tap below.
          </Text>
        </View>
        <Pressable onPress={onFinish} style={styles.ctaBtn}>
          <Text style={styles.ctaText}>Start my recovery journey</Text>
          <ArrowRight size={20} color={colors.black} strokeWidth={2} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headline: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 34,
    color: colors.white,
    lineHeight: 38,
    marginTop: 22,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 14,
  },
  ctaBtn: {
    height: 58,
    borderRadius: 32,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  ctaText: {
    fontFamily: fonts.ui,
    fontSize: 17,
    fontWeight: '700',
    color: colors.black,
  },
});
