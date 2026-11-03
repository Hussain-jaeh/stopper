import React, { useEffect, useMemo } from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay,
  Easing, useReducedMotion, cancelAnimation,
} from 'react-native-reanimated';

type Mood = 'idle' | 'cheer';

/**
 * A mascot pose that's alive: a slow breath (a slight stretch up from the
 * feet) with a small sway. 'cheer' poses bounce a little more. Each instance
 * starts at a random point in its cycle so a screen of mascots never moves in
 * lockstep. Holds still with Reduce Motion on.
 */
export function Mascot({
  source, style, mood = 'idle', accessibilityLabel,
}: {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  mood?: Mood;
  accessibilityLabel?: string;
}) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  // Random phase and a slightly different tempo per instance.
  const { phase, period } = useMemo(
    () => ({ phase: Math.random() * 1200, period: (mood === 'cheer' ? 1500 : 2600) + Math.random() * 500 }),
    [mood],
  );

  useEffect(() => {
    if (reduce) { t.value = 0; return; }
    const ease = Easing.inOut(Easing.sin);
    t.value = withDelay(phase, withRepeat(withSequence(
      withTiming(1, { duration: period / 2, easing: ease }),
      withTiming(0, { duration: period / 2, easing: ease }),
    ), -1));
    return () => cancelAnimation(t);
  }, [reduce, phase, period]);

  const lift = mood === 'cheer' ? 5 : 2;
  const sway = mood === 'cheer' ? 2.5 : 1.2;

  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: -t.value * lift },
      { rotate: `${(t.value - 0.5) * sway}deg` },
      { scaleY: 1 + t.value * 0.018 },
      { scaleX: 1 - t.value * 0.008 },
    ],
  }));

  // Animate a plain wrapper and keep the Image itself static: animating an
  // Image directly can leave it blank on some RN/Reanimated builds.
  const flat = StyleSheet.flatten(style) ?? {};
  return (
    <Animated.View style={[flat as any, anim]} pointerEvents="none">
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        accessibilityLabel={accessibilityLabel}
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}
