import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wordmark, SecondaryButton, Starfield, Laurel } from '../../components/primitives';
import { colors, fonts } from '../../theme/tokens';

interface WelcomeScreenProps {
  onNext: () => void;
  onSignIn?: () => void;
}

export function WelcomeScreen({ onNext, onSignIn }: WelcomeScreenProps) {
  return (
    <LinearGradient
      colors={['#0B4A3A', '#07332A', '#04201A']}
      locations={[0, 0.55, 1]}
      style={styles.fill}
    >
      <Starfield />
      <View style={styles.inner}>
        {/* Top */}
        <View style={styles.topBar}>
          <Wordmark size={26} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.headline}>Welcome!</Text>
          <Text style={styles.subtitle}>
            Let's start by finding out if your habit has a hold on you.
          </Text>
          <View style={{ marginTop: 24 }}>
            <Laurel size={30} />
          </View>
        </View>

        {/* CTA */}
        <View style={styles.bottom}>
          <View style={styles.ctaRow}>
            <SecondaryButton onPress={onNext}>Start Now</SecondaryButton>
          </View>
          <Pressable onPress={onSignIn}>
            <Text style={styles.alreadyHave}>Already have an account?</Text>
          </Pressable>
          <Text style={styles.legal}>
            By continuing, you agree to our Terms & Conditions and Privacy Policy
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: {
    flex: 1,
    padding: 24,
    paddingTop: 18,
    paddingBottom: 26,
  },
  topBar: {
    alignItems: 'center',
    paddingTop: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headline: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 44,
    letterSpacing: -1,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 21,
    color: colors.fgMuted,
    lineHeight: 28,
    marginTop: 14,
    maxWidth: 280,
  },
  bottom: {
    marginTop: 'auto',
    gap: 18,
  },
  ctaRow: {
    alignItems: 'flex-end',
  },
  alreadyHave: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  legal: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.fgFaint,
    textAlign: 'center',
    lineHeight: 17,
  },
});
