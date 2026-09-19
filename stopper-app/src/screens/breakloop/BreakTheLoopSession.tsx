// screens/breakloop/BreakTheLoopSession.tsx
// The 60-second task. Deliberately bare: no digits, no counter, no feedback.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { type as T } from '../../constants/typography';
import { INKS, DURATION_SECONDS, makeTrial, isCorrect, type Trial, type InkId } from '../../lib/breakTheLoop';

export function BreakTheLoopSession({ onDone, onExit }: { onDone: () => void; onExit: () => void }) {
  const [trial, setTrial] = useState<Trial>(() => makeTrial(null));
  const opacity = useSharedValue(1);
  const progress = useSharedValue(1);
  const finished = useRef(false);

  // Both animation callbacks below run as worklets on the UI thread, so they
  // may do nothing except hand back to JS. The original called makeTrial() and
  // mutated a React ref from inside one, which crashed the app on the first
  // tap — a non-worklet function cannot be invoked on the UI thread, and a
  // captured ref is frozen once it crosses over.
  const finishOnce = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  const advance = useCallback(() => {
    setTrial(prev => makeTrial(prev));
    opacity.value = withTiming(1, { duration: 110 });
  }, [opacity]);

  // The only passage-of-time signal: a line that quietly runs out.
  // No digits — a ticking clock creates urgency and invites beating it.
  useEffect(() => {
    progress.value = withTiming(0, { duration: DURATION_SECONDS * 1000, easing: Easing.linear }, (done) => {
      'worklet';
      if (done) runOnJS(finishOnce)();
    });
  }, [finishOnce, progress]);

  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const answer = useCallback((tapped: InkId) => {
    // A wrong tap is indistinguishable from no tap. No shake, flash, sound or haptic.
    if (!isCorrect(trial, tapped)) return;
    opacity.value = withTiming(0, { duration: 110 }, (done) => {
      'worklet';
      if (done) runOnJS(advance)();
    });
  }, [trial, advance, opacity]);

  return (
    <View style={styles.screen}>
      <View style={styles.track}><Animated.View style={[styles.fill, barStyle]} /></View>

      <Text style={styles.instruction} accessibilityRole="header">TAP THE COLOUR OF THE INK</Text>

      <View style={styles.stage}>
        <Animated.Text
          style={[styles.word, { color: trial.ink.hex }, wordStyle]}
          accessibilityLabel={`The word ${trial.word.word}, printed in ${trial.ink.word} ink`}
        >
          {trial.word.word}
        </Animated.Text>
      </View>

      {/* Answers are bare colour. Labelling them adds a second reading layer
          and makes the task feel like a marked quiz. */}
      <View style={styles.grid}>
        {INKS.map(c => (
          <Pressable
            key={c.id}
            onPress={() => answer(c.id)}
            accessibilityRole="button"
            accessibilityLabel={c.word}
            style={[styles.swatch, { backgroundColor: c.hex }]}
          />
        ))}
      </View>

      {/* Always escapable. A tool you may put down, not a session you must finish. */}
      <Pressable onPress={onExit} style={styles.exit} accessibilityRole="button">
        <Text style={styles.exitTxt}>End early</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.screenPad, paddingBottom: 22, paddingTop: 8 },
  track: { height: 3, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', backgroundColor: colors.jade400 },
  instruction: { textAlign: 'center', marginTop: 20, fontSize: 11.5, letterSpacing: 2, fontWeight: '800', color: colors.textMuted },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  word: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 62, letterSpacing: -2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  swatch: { width: '47.5%', height: 84, borderRadius: 18, flexGrow: 1 },
  exit: { alignItems: 'center', paddingVertical: 10 },
  // contrast: #8A8A8A on #0D0D0D = 5.63:1. Do not use a fainter grey here.
  exitTxt: { color: colors.textMuted, fontSize: 14.5, fontWeight: '600' },
});
