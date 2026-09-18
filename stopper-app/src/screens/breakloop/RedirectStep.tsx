// screens/breakloop/RedirectStep.tsx
// Step 3 of SOS (breathe → why → redirect).
// Break the Loop is the dominant action; the four existing redirects are
// demoted to a quiet list beneath it.
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft, ChevronRight, ArrowRight, Brain,
  Footprints, GlassWater, ArrowDownUp, MessageCircle, type LucideIcon,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { type as T } from '../../constants/typography';

const REDIRECTS: { Icon: LucideIcon; label: string; sub: string; id: string }[] = [
  { id: 'walk',  Icon: Footprints,    label: 'Take a walk',      sub: 'Ten minutes outside' },
  { id: 'water', Icon: GlassWater,    label: 'Drink water',      sub: 'Cold, slowly' },
  { id: 'push',  Icon: ArrowDownUp,   label: 'Do pushups',       sub: 'Until your arms shake' },
  { id: 'msg',   Icon: MessageCircle, label: 'Message a friend', sub: 'Tell someone you are struggling' },
];

export function RedirectStep({
  onStart, onBack, onPick,
}: { onStart: () => void; onBack: () => void; onPick: (id: string) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPad, paddingBottom: 30 }}>
      <View style={styles.nav}>
        <Pressable onPress={onBack} style={styles.circ} accessibilityLabel="Back"><ChevronLeft size={20} color={colors.white} /></Pressable>
        <View style={styles.track}><View style={styles.fill} /></View>
        <Text style={styles.step}>3 / 3</Text>
      </View>

      <Text style={styles.eyebrow}>REDIRECT</Text>
      <Text style={styles.h1}>You don't have to{'\n'}act on it.</Text>
      <Text style={styles.lede}>Give yourself 60 seconds.</Text>

      {/* dominant */}
      <Pressable onPress={onStart} style={styles.hero}>
        <View style={styles.heroHead}>
          <LinearGradient colors={['#2DD4A0', '#0C6B4E']} start={{ x: 0.3, y: 0.2 }} end={{ x: 1, y: 1 }} style={styles.heroIcon}>
            <Brain size={23} color="#fff" strokeWidth={2.1} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Break the Loop</Text>
            <Text style={styles.heroMeta}>60 seconds · works anywhere</Text>
          </View>
        </View>
        <Text style={styles.heroBody}>
          A focused attention exercise. It occupies the part of your mind the craving is using.
        </Text>
        <LinearGradient colors={['#14B888', '#2DD4A0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCta}>
          <Text style={styles.heroCtaTxt}>Begin</Text>
          <ArrowRight size={18} color={colors.onAccent} />
        </LinearGradient>
      </Pressable>

      {/* demoted */}
      <View style={styles.divider}>
        <View style={styles.rule} /><Text style={styles.dividerTxt}>OR TRY</Text><View style={styles.rule} />
      </View>
      <View style={{ gap: 8 }}>
        {REDIRECTS.map(({ id, Icon, label, sub }) => (
          <Pressable key={id} onPress={() => onPick(id)} style={styles.row}>
            <Icon size={19} color={colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowSub}>{sub}</Text>
            </View>
            <ChevronRight size={17} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 22 },
  circ: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 4, borderRadius: 99, backgroundColor: colors.surface2, overflow: 'hidden' },
  fill: { width: '100%', height: '100%', backgroundColor: colors.jade500 },
  step: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  eyebrow: { fontSize: 11.5, letterSpacing: 2, fontWeight: '800', color: colors.jade300 },
  h1: { ...T.h1, fontSize: 30, marginTop: 10, lineHeight: 32 },
  lede: { fontSize: 16.5, color: colors.textMuted, marginTop: 12, fontWeight: '500' },
  hero: { marginTop: 26, padding: 22, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(45,212,160,0.42)', backgroundColor: 'rgba(20,184,136,0.10)' },
  heroHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { ...T.h1, fontSize: 21 },
  heroMeta: { fontSize: 13.5, color: colors.jade300, fontWeight: '600', marginTop: 2 },
  heroBody: { fontSize: 14.5, color: '#B9C4C0', lineHeight: 22, marginTop: 16, marginBottom: 18, fontWeight: '500' },
  heroCta: { height: 52, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  heroCtaTxt: { color: colors.onAccent, fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 26, marginBottom: 12 },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  // contrast: #8A8A8A on #0D0D0D = 5.63:1. Do not use a fainter grey.
  dividerTxt: { fontSize: 11.5, letterSpacing: 1.8, color: colors.textMuted, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 16, borderRadius: 15, backgroundColor: '#161616', borderWidth: 1, borderColor: 'rgba(255,255,255,0.055)' },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.white },
  rowSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
});
