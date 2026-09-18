/**
 * Break the Loop — a 60-second attention task for the middle of an urge.
 *
 * The mechanic is Stroop: a colour word printed in a conflicting ink, and the
 * user taps the INK. Overriding an automatic response is the point, which is
 * also the thing the whole app is asking of them.
 *
 * Deliberately NOT a game. No score, no high score, no streak, no celebration.
 * Two of the habits users come here to quit are Gaming and Social media, and a
 * rewarding loop would rebuild the exact compulsion this is meant to interrupt.
 * Completion is binary: the 60 seconds passed and you were here for it. Wrong
 * answers and timeouts cost nothing — they just advance.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { PanicCta, TextButton } from './PanicChrome';
import { colors } from '../../constants/colors';

/** Saturated and mutually unmistakable — the task collapses if two read alike. */
const INKS = [
  { key: 'red',    label: 'Red',    hex: '#FF5A4A' },
  { key: 'blue',   label: 'Blue',   hex: '#4A9CFF' },
  { key: 'green',  label: 'Green',  hex: '#2DD4A0' },
  { key: 'yellow', label: 'Yellow', hex: '#F2C23E' },
] as const;

type InkKey = typeof INKS[number]['key'];

const SESSION_MS = 60_000;
/** After this many sessions, stop offering another one. See DoneStep. */
const ENOUGH_SESSIONS = 3;

function pick<T>(xs: readonly T[]): T { return xs[Math.floor(Math.random() * xs.length)]; }

/** A round always conflicts: the word never names its own ink. */
function makeRound() {
  const ink = pick(INKS);
  const word = pick(INKS.filter(c => c.key !== ink.key));
  return { inkKey: ink.key as InkKey, inkHex: ink.hex, word: word.label.toUpperCase() };
}

export function BreakTheLoopStep({
  onFinish,
  onSomethingElse,
  onClose,
}: {
  /** They're done and going back to the flow. */
  onFinish: () => void;
  /** Three rounds deep and still struggling — hand them off. */
  onSomethingElse: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<'play' | 'done'>('play');
  const [sessions, setSessions] = useState(0);
  const [round, setRound] = useState(makeRound);
  const [remaining, setRemaining] = useState(SESSION_MS);
  const endsAt = useRef(Date.now() + SESSION_MS);
  const reduceMotion = useReducedMotion();

  const startSession = useCallback(() => {
    endsAt.current = Date.now() + SESSION_MS;
    setRemaining(SESSION_MS);
    setRound(makeRound());
    setPhase('play');
  }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => {
      const left = endsAt.current - Date.now();
      if (left <= 0) {
        clearInterval(id);
        setRemaining(0);
        setSessions(s => s + 1);
        setPhase('done');
      } else {
        setRemaining(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  // Every answer advances. Right or wrong is not the point and is never shown.
  const answer = useCallback(() => setRound(makeRound()), []);

  if (phase === 'done') {
    return (
      <DoneStep
        sessions={sessions}
        onAgain={startSession}
        onFinish={onFinish}
        onSomethingElse={onSomethingElse}
      />
    );
  }

  const progress = 1 - remaining / SESSION_MS;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <View style={styles.col}>
      <View style={styles.topRow}>
        <Text style={styles.eyebrow}>BREAK THE LOOP</Text>
        <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={12} style={styles.closeBtn}>
          <X size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>
      <Text style={styles.remaining}>{seconds}s</Text>

      <View style={styles.stage}>
        <Text style={styles.instruction}>Tap the colour it's written in</Text>
        <Animated.Text
          key={`${round.word}-${round.inkKey}-${seconds}`}
          entering={reduceMotion ? undefined : FadeIn.duration(120)}
          style={[styles.word, { color: round.inkHex }]}
          accessibilityLabel={`The word ${round.word}, printed in ${round.inkKey}`}
        >
          {round.word}
        </Animated.Text>
      </View>

      <View style={styles.options}>
        {INKS.map(c => (
          <Pressable
            key={c.key}
            onPress={answer}
            accessibilityRole="button"
            accessibilityLabel={c.label}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          >
            <View style={[styles.swatch, { backgroundColor: c.hex }]} />
            <Text style={styles.optionLabel}>{c.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DoneStep({
  sessions, onAgain, onFinish, onSomethingElse,
}: {
  sessions: number;
  onAgain: () => void;
  onFinish: () => void;
  onSomethingElse: () => void;
}) {
  // Three sessions in and still here means this isn't working. Offering a
  // fourth round would be the app quietly failing someone who needs more.
  const enough = sessions >= ENOUGH_SESSIONS;

  return (
    <View style={styles.col}>
      <View style={styles.center}>
        <Text style={styles.h1}>{enough ? 'Still with you' : 'You made it through'}</Text>
        <Text style={styles.body}>
          {enough
            ? "You've given this a real go. If it's still loud, that's not a failure — it just means you need something with more weight behind it."
            : 'A minute ago that urge had your whole attention. You gave it to something else instead.'}
        </Text>
      </View>
      <View style={{ gap: 12 }}>
        {enough ? (
          <>
            <PanicCta onClick={onSomethingElse}>Try something else</PanicCta>
            <TextButton onPress={onFinish}>I'm good</TextButton>
          </>
        ) : (
          <>
            <PanicCta onClick={onAgain}>Another 60 seconds</PanicCta>
            <TextButton onPress={onFinish}>I'm good</TextButton>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 12, letterSpacing: 1.6, color: colors.textMuted, fontFamily: 'PlusJakartaSans_600SemiBold' },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  track: { height: 4, borderRadius: 999, backgroundColor: colors.surface2, overflow: 'hidden', marginTop: 14 },
  trackFill: { height: '100%', borderRadius: 999, backgroundColor: colors.jade500 },
  remaining: { marginTop: 8, fontSize: 12, color: colors.textFaint, fontFamily: 'PlusJakartaSans_500Medium' },

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instruction: { fontSize: 15, color: colors.textMuted, marginBottom: 28, fontFamily: 'PlusJakartaSans_400Regular' },
  word: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 58, letterSpacing: -1 },

  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  option: {
    flexBasis: '47%', flexGrow: 1, height: 64, borderRadius: 16,
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16,
  },
  optionPressed: { backgroundColor: colors.surface3 },
  swatch: { width: 26, height: 26, borderRadius: 8 },
  optionLabel: { fontSize: 16, color: colors.white, fontFamily: 'PlusJakartaSans_600SemiBold' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 29, color: colors.white, textAlign: 'center' },
  body: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 23, marginTop: 16 },
});
