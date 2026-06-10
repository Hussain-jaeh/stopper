import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ArrowRight } from 'lucide-react-native';
import { Sparkles } from '../../components/primitives';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  onEnter: () => void;       // proceed into the app
}

export function AuthSuccessScreen({ onEnter }: Props) {
  return (
    <LinearGradient colors={['#11A074', '#0B6B4D', '#053A2B']} locations={[0, 0.45, 1]} style={styles.fill}>
      <Sparkles count={16} />
      <View style={styles.inner}>
        <View style={styles.center}>
          <View style={styles.badge}>
            <Check size={46} color={colors.white} strokeWidth={3} />
          </View>
          <Text style={styles.h1}>You're all set</Text>
          <Text style={styles.sub}>Your account is secured. Your journey is saved and synced.</Text>
        </View>
        <Pressable onPress={onEnter} style={styles.cta}>
          <Text style={styles.ctaLabel}>Enter Stopper</Text>
          <ArrowRight size={20} color={colors.black} strokeWidth={2} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 26 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  h1: { fontFamily: fonts.display, fontWeight: '800', fontSize: 32, color: colors.white, marginTop: 22 },
  sub: { fontFamily: fonts.ui, fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 23, textAlign: 'center', marginTop: 12, maxWidth: 280 },
  cta: {
    height: 58, borderRadius: 32, backgroundColor: colors.white,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  ctaLabel: { fontFamily: fonts.ui, fontSize: 17, fontWeight: '700', color: colors.black },
});
