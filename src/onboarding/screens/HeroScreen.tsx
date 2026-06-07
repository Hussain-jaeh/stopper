import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { Wordmark, PrimaryButton, DotTexture, PulseHero, PressRow, Dots } from '../../components/primitives';
import { colors, fonts } from '../../theme/tokens';
import { ChevronRight } from 'lucide-react-native';

interface HeroScreenProps {
  onNext: () => void;
}

export function HeroScreen({ onNext }: HeroScreenProps) {
  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={styles.inner}>
        {/* Wordmark */}
        <View style={styles.topBar}>
          <Wordmark size={26} />
        </View>

        {/* Orb */}
        <View style={styles.orbWrap}>
          <PulseHero
            icon={<Sprout size={50} color={colors.white} strokeWidth={2.2} />}
            size={210}
          />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>Welcome to Stopper</Text>
          <Text style={styles.subtitle}>
            With over{' '}
            <Text style={styles.bold}>2,000,000 users</Text>, Stopper is{' '}
            <Text style={styles.bold}>class-leading</Text> and based on{' '}
            <Text style={styles.bold}>years of research</Text>.
          </Text>
          <View style={styles.pressRow}>
            <PressRow />
          </View>
        </View>

        {/* Dots */}
        <View style={styles.dots}>
          <Dots count={6} active={0} />
        </View>

        {/* CTA */}
        <PrimaryButton
          onPress={onNext}
          icon={<ChevronRight size={20} color={colors.white} strokeWidth={2} />}
        >
          Next
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
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
  orbWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 30,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 17,
    color: colors.fgMuted,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 22,
  },
  bold: {
    color: colors.white,
    fontWeight: '600',
  },
  pressRow: {
    alignItems: 'center',
  },
  dots: {
    alignItems: 'center',
    marginVertical: 22,
  },
});
