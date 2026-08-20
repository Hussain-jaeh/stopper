import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, Waves, Anchor, Footprints, GlassWater, MessageCircle, Dumbbell,
  Check, ShieldCheck, HeartHandshake,
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { type } from '../../constants/typography';
import { PanicCta, TextButton } from './PanicChrome';

export type PanicProfile = { streak: number; longest: number; habit: string; reason: string };

/* ---- 1 · interrupt + reassure ---- */
export function IntroStep({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  return (
    <View style={styles.col}>
      <View style={styles.topClose}><CloseBtn onClose={onClose} /></View>
      <View style={styles.center}>
        <View style={styles.coralBadge}><Waves size={42} color="#FF8A6B" /></View>
        <Text style={styles.h1}>You're having{'\n'}a craving</Text>
        <Text style={styles.body}>
          That's normal — and it's <Text style={styles.bodyStrong}>temporary</Text>. A craving is a wave: it rises, peaks, and passes. Let's ride it out together.
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <PanicCta onClick={onStart}>Start breathing</PanicCta>
        <TextButton onPress={onClose}>I'm okay now</TextButton>
      </View>
    </View>
  );
}

/* ---- 3 · remember your why ---- */
export function WhyStep({ p, onNext, onClose }: { p: PanicProfile; onNext: () => void; onClose: () => void }) {
  return (
    <View style={styles.col}>
      <View style={styles.topClose}><CloseBtn onClose={onClose} /></View>
      <View style={styles.center}>
        <Anchor size={30} color={colors.jade300} />
        <Text style={[styles.eyebrow, { marginTop: 14 }]}>REMEMBER YOUR WHY</Text>
        <Text style={styles.quote}>"{p.reason || 'You started this for a reason.'}"</Text>
        <View style={styles.streakPill}>
          <Text style={styles.streakNum}>🔥 {p.streak} days</Text>
          <Text style={styles.streakSub}>Don't trade this for five minutes.</Text>
        </View>
      </View>
      <PanicCta onClick={onNext}>Keep going</PanicCta>
    </View>
  );
}

/* ---- 4 · change your state (redirect) ---- */
const REDIRECTS = [
  { Icon: Footprints, label: 'Take a short walk' },
  { Icon: GlassWater, label: 'Drink a glass of water' },
  { Icon: Dumbbell, label: 'Do 10 pushups' },
  { Icon: MessageCircle, label: 'Message my buddy' },
];

export function RedirectStep({ onMadeIt, onClose }: { onMadeIt: () => void; onClose: () => void }) {
  return (
    <View style={styles.col}>
      <View style={styles.topClose}><CloseBtn onClose={onClose} /></View>
      <View style={{ paddingTop: 8 }}>
        <Text style={styles.h2}>Redirect the energy</Text>
        <Text style={[styles.body, { textAlign: 'left', marginHorizontal: 0, marginTop: 10 }]}>
          Change your state — pick one and do it right now.
        </Text>
      </View>
      <View style={{ gap: 12, marginTop: 22, flex: 1 }}>
        {REDIRECTS.map(({ Icon, label }) => (
          <View key={label} style={styles.redirectRow}>
            <View style={styles.redirectIcon}><Icon size={20} color={colors.jade300} /></View>
            <Text style={styles.redirectLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <PanicCta onClick={onMadeIt}>The urge is passing</PanicCta>
    </View>
  );
}

/* ---- 6 · win ---- */
export function WinStep({ p, onClose }: { p: PanicProfile; onClose: () => void }) {
  return (
    <View style={[styles.col, { backgroundColor: 'transparent' }]}>
      <View style={styles.center}>
        <View style={styles.winBadge}><Check size={40} color={colors.onAccent} strokeWidth={3} /></View>
        <Text style={[styles.h1, { fontSize: 27, marginTop: 16 }]}>You rode the wave</Text>
        <Text style={styles.body}>
          Your streak is intact —{' '}
          <Text style={{ color: colors.jade300, fontWeight: '700' }}>{p.streak} days</Text>
          . That urge had no power over you.
        </Text>
        <View style={styles.loggedPill}>
          <ShieldCheck size={15} color={colors.jade300} />
          <Text style={styles.loggedTxt}>Resisted urge logged</Text>
        </View>
      </View>
      <PanicCta onClick={onClose}>Back to my day</PanicCta>
    </View>
  );
}

/* ---- 7 · relapse (compassionate) ---- */
const TRIGGERS = ['Stress', 'Boredom', 'Loneliness', 'Anxiety', 'Late night', 'Other'];

export function RelapseStep({ onReset, onClose }: { onReset: (trigger?: string) => void; onClose: () => void }) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <View style={styles.col}>
      <View style={styles.topClose}><CloseBtn onClose={onClose} /></View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <HeartHandshake size={38} color={colors.jade300} />
          <Text style={[styles.h2, { textAlign: 'center', marginTop: 14 }]}>A slip isn't a failure</Text>
          <Text style={styles.body}>
            Recovery isn't a straight line. What matters is that you're still here. Let's learn from it.
          </Text>
        </View>
        <Text style={[styles.eyebrow, { marginTop: 26, marginBottom: 12 }]}>WHAT TRIGGERED IT? (OPTIONAL)</Text>
        <View style={styles.chipWrap}>
          {TRIGGERS.map(t => {
            const on = sel === t;
            return (
              <Pressable key={t} onPress={() => setSel(on ? null : t)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipTxt, on && { color: colors.onAccent }]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <PanicCta onClick={() => onReset(sel ?? undefined)}>Begin a fresh streak</PanicCta>
    </View>
  );
}

/* ---- 8 · reset confirmation ---- */
export function ResetStep({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.col}>
      <View style={styles.center}>
        <LinearGradient
          colors={[colors.jade400, colors.jade700]}
          start={{ x: 0.36, y: 0.3 }}
          end={{ x: 1, y: 1 }}
          style={styles.resetOrb}
        >
          <Text style={styles.resetOne}>1</Text>
        </LinearGradient>
        <Text style={[styles.h1, { marginTop: 18 }]}>Day 1. Again.</Text>
        <Text style={styles.body}>
          Every fresh start is proof you haven't given up. Your longest streak still counts — you know you can do this.
        </Text>
      </View>
      <PanicCta onClick={onClose}>Begin again</PanicCta>
    </View>
  );
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.closeBtn}>
      <X size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  col: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 22 },
  topClose: { flexDirection: 'row', justifyContent: 'flex-end' },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coralBadge: {
    width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(242,98,46,0.14)', borderWidth: 1, borderColor: 'rgba(242,98,46,0.3)', marginBottom: 18,
  },
  h1: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 29, color: colors.white, textAlign: 'center', lineHeight: 33 },
  h2: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 24, color: colors.white },
  body: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 23, marginTop: 16, marginHorizontal: 8 },
  bodyStrong: { color: colors.white, fontWeight: '700' },
  eyebrow: { ...type.eyebrow, color: colors.jade300 },
  quote: {
    fontFamily: 'BricolageGrotesque_700Bold', fontSize: 21, color: colors.white,
    textAlign: 'center', lineHeight: 28, marginTop: 14, marginHorizontal: 8,
  },
  streakPill: {
    alignItems: 'center', marginTop: 26,
    backgroundColor: 'rgba(255,107,74,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,74,0.28)',
    borderRadius: 18, paddingVertical: 16, paddingHorizontal: 22,
  },
  streakNum: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 22, color: '#FF8A6B' },
  streakSub: { fontSize: 13.5, color: colors.textMuted, marginTop: 5 },
  redirectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 15,
  },
  redirectIcon: {
    width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(20,184,136,0.13)',
  },
  redirectLabel: { fontSize: 16, fontWeight: '500', color: colors.white },
  winBadge: {
    width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.jade500, shadowColor: colors.jade500, shadowOpacity: 0.5,
    shadowRadius: 24, shadowOffset: { width: 0, height: 0 },
  },
  loggedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16,
    backgroundColor: 'rgba(20,184,136,0.12)', borderWidth: 1, borderColor: 'rgba(20,184,136,0.3)',
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 15,
  },
  loggedTxt: { fontSize: 12.5, fontWeight: '700', color: colors.jade300 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 11, paddingHorizontal: 16, borderRadius: 999,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.jade500, borderColor: 'transparent' },
  chipTxt: { fontSize: 14, fontWeight: '600', color: colors.white },
  resetOrb: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  resetOne: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 44, color: colors.white },
});
