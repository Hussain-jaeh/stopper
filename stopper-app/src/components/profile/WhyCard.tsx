import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Anchor } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

type Props = { reason: string; habit: string; started: string; index?: number };

export function WhyCard({ reason, habit, started, index = 2 }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)}>
      <LinearGradient
        colors={['rgba(20,184,136,0.10)', 'rgba(46,125,209,0.07)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.head}>
          <Anchor size={17} color={colors.jade300} />
          <Text style={styles.eyebrow}>YOUR WHY</Text>
        </View>
        <Text style={styles.quote}>"{reason}"</Text>
        <Text style={styles.meta}>Quitting {habit} · started {started}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: 18, borderWidth: 1, borderColor: 'rgba(20,184,136,0.22)' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  eyebrow: { fontSize: 12.5, fontWeight: '700', letterSpacing: 1.5, color: colors.jade300 },
  quote: { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 18, lineHeight: 25, color: colors.white },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 12 },
});
