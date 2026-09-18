// screens/breakloop/BreakTheLoopComplete.tsx
// Binary completion. The 60 seconds passed and you were present for them.
// Nothing is measured, so the two exits carry equal visual weight —
// EXCEPT on the third session, where the app should steer elsewhere.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { type as T } from '../../constants/typography';

export function BreakTheLoopComplete({
  variant = 'first', onAgain, onDone,
}: { variant?: 'first' | 'third'; onAgain: () => void; onDone: () => void }) {
  const third = variant === 'third';
  const [reduce, setReduce] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduce); }, []);
  const Enter: any = reduce ? View : Animated.View;
  const enterProps = reduce ? {} : { entering: FadeInDown.duration(450) };

  return (
    <View style={styles.screen}>
      <Enter {...enterProps} style={styles.center}>
        {/* outlined, not filled — a quiet acknowledgement, not a trophy */}
        <View style={styles.mark}><Check size={28} color={colors.jade300} strokeWidth={2.4} /></View>

        <Text style={styles.h1}>{third ? 'Still with you.' : 'You made it through.'}</Text>
        <Text style={styles.body}>
          {third
            ? 'That\u2019s three times tonight. You keep choosing not to act on it \u2014 and something with more in it might hold you better right now.'
            : 'The craving was there and you didn\u2019t act on it. That\u2019s the whole thing.'}
        </Text>
      </Enter>

      <View style={{ gap: 10 }}>
        {third ? (
          <>
            <Pressable onPress={onDone}>
              <LinearGradient colors={['#14B888', '#2DD4A0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
                <Text style={styles.primaryTxt}>Try something else</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={onAgain} style={styles.equal}><Text style={styles.equalTxt}>Another 60 seconds</Text></Pressable>
          </>
        ) : (
          <>
            <Pressable onPress={onAgain} style={styles.equal}><Text style={styles.equalTxt}>Another 60 seconds</Text></Pressable>
            <Pressable onPress={onDone} style={styles.equal}><Text style={styles.equalTxt}>I'm good</Text></Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.screenPad, paddingBottom: 24, paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(45,212,160,0.45)', backgroundColor: 'rgba(20,184,136,0.10)' },
  h1: { ...T.h1, fontSize: 30, color: colors.white, marginTop: 22, textAlign: 'center' },
  body: { fontSize: 16, color: colors.textMuted, lineHeight: 24, textAlign: 'center', marginTop: 14, paddingHorizontal: 22 },
  // equal weight: identical height, radius and type — only the fill differs
  equal: { height: 54, borderRadius: 27, backgroundColor: colors.surface1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  equalTxt: { color: colors.white, fontSize: 16.5, fontWeight: '700' },
  primary: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: colors.onAccent, fontSize: 16.5, fontWeight: '800' },
});
