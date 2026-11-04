import React, { useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
  Easing, useReducedMotion, cancelAnimation,
} from 'react-native-reanimated';

/**
 * A flame that behaves like one: uneven timings, a slight lean and a lift
 * from the base, never a clean metronome pulse. Origin is the bottom of the
 * glyph so it grows upward instead of swelling from the centre.
 * Stays still when the user has Reduce Motion on, or when `lit` is false
 * (a 0-day streak shouldn't be burning yet).
 */
export function FlickerGlyph({ children, size, lit = true }: { children: React.ReactNode; size: number; lit?: boolean }) {
  const reduce = useReducedMotion();
  const sy = useSharedValue(1);
  const rot = useSharedValue(0);

  useEffect(() => {
    if (reduce || !lit) { sy.value = 1; rot.value = 0; return; }
    const ease = Easing.inOut(Easing.quad);
    sy.value = withRepeat(withSequence(
      withTiming(1.09, { duration: 180, easing: ease }),
      withTiming(0.97, { duration: 240, easing: ease }),
      withTiming(1.05, { duration: 140, easing: ease }),
      withTiming(1.0,  { duration: 420, easing: ease }),
      withTiming(1.0,  { duration: 600 }),               // rest — real flames settle
    ), -1);
    rot.value = withRepeat(withSequence(
      withTiming(-4, { duration: 260, easing: ease }),
      withTiming(3,  { duration: 300, easing: ease }),
      withTiming(-1, { duration: 220, easing: ease }),
      withTiming(0,  { duration: 760, easing: ease }),
    ), -1);
    return () => { cancelAnimation(sy); cancelAnimation(rot); };
  }, [reduce, lit]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: size / 2 },
      { rotate: `${rot.value}deg` },
      { scaleY: sy.value },
      { scaleX: 2 - sy.value * 0.97 - 0.03 }, // slight squash as it stretches
      { translateY: -size / 2 },
    ],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
