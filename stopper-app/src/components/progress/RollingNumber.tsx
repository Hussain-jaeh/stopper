import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing, useReducedMotion,
} from 'react-native-reanimated';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * A number that rolls into place, odometer style: each digit slides through
 * its own column, last digit first, and unchanged digits stay still. Plays on
 * mount and whenever the value changes; never loops. Non-digits (".", "%")
 * are static. Reduce Motion shows the final value immediately.
 */
export function RollingNumber({ value, style, startDelay = 0 }: { value: string; style: TextStyle; startDelay?: number }) {
  const size = (style.fontSize as number) ?? 20;
  const lh = Math.round(size * 1.18);
  const chars = value.split('');
  return (
    <View style={styles.row} accessible accessibilityLabel={value}>
      {chars.map((c, i) => {
        const fromRight = chars.length - 1 - i;
        return /\d/.test(c)
          ? <Digit key={`d${fromRight}`} digit={+c} lh={lh} style={style} delay={startDelay + fromRight * 70} />
          : <Text key={`s${fromRight}`} style={[style, { lineHeight: lh }]}>{c}</Text>;
      })}
    </View>
  );
}

function Digit({ digit, lh, style, delay }: { digit: number; lh: number; style: TextStyle; delay: number }) {
  const reduce = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    const to = -digit * lh;
    y.value = reduce
      ? to
      : withDelay(delay, withTiming(to, { duration: 560, easing: Easing.out(Easing.cubic) }));
  }, [digit, lh, reduce]);

  const strip = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <View style={{ height: lh, overflow: 'hidden' }}>
      {/* Sizes the slot to the final digit so spacing never jumps. */}
      <Text style={[style, { lineHeight: lh, opacity: 0 }]}>{digit}</Text>
      <Animated.View style={[StyleSheet.absoluteFill, strip]}>
        {DIGITS.map(d => (
          <Text key={d} style={[style, { lineHeight: lh, textAlign: 'center' }]}>{d}</Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'flex-end' } });
