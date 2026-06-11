import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Quote } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

export const QUOTES: [string, string][] = [
  ['Every day you resist,', 'you become stronger.'],
  ['Small steps become', 'life-changing victories.'],
  ['You are not your urges.', 'You are who you choose to be.'],
  ['Progress, not perfection —', 'one day at a time.'],
  ['The craving passes.', 'Your strength remains.'],
];

export function MotivationCard({ quote, index = 4 }: { quote: [string, string]; index?: number }) {
  return (
    <View>
      <LinearGradient
        colors={['rgba(20,184,136,0.10)', 'rgba(46,125,209,0.08)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Quote size={22} color={colors.jade300} style={{ marginTop: 2 }} />
        <Text style={styles.quote}>{quote[0]}{'\n'}{quote[1]}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', padding: 18, borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(20,184,136,0.22)' },
  quote: { ...type.cardTitle, color: colors.white, lineHeight: 24, flex: 1 },
});
