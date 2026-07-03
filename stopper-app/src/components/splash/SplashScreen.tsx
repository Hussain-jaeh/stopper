import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withDelay,
  withSequence, Easing, FadeInDown,
} from 'react-native-reanimated';
import { ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

type Props = {
  tagline?: string;
  minDurationMs?: number;
  onFinish?: () => void;
};

export function SplashScreen({ tagline = 'Take back control.', minDurationMs = 1600, onFinish }: Props) {
  const markScale = useSharedValue(0.6);
  const pulse = useSharedValue(0);

  useEffect(() => {
    markScale.value = withSequence(
      withTiming(1.0, { duration: 700, easing: Easing.out(Easing.back(1.6)) }),
      withRepeat(withSequence(
        withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ), -1, false),
    );
    pulse.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.ease) }), -1, false);

    if (onFinish) {
      const t = setTimeout(onFinish, minDurationMs);
      return () => clearTimeout(t);
    }
  }, []);

  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: markScale.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.5 }],
    opacity: 0.5 * (1 - pulse.value),
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#11A074', '#0B6B4D', '#064634', '#042a20']}
        locations={[0, 0.44, 0.72, 1]}
        start={{ x: 0.5, y: 0.05 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, { top: -60, right: -70, backgroundColor: 'rgba(255,150,92,0.22)' }]} />
      <View style={[styles.glow, { bottom: -50, left: -80, backgroundColor: 'rgba(45,212,160,0.26)' }]} />

      <View style={styles.center}>
        <View style={styles.markArea}>
          <Animated.View style={[styles.pulse, pulseStyle]} />
          <Animated.View style={[styles.mark, markStyle]}>
            <ShieldCheck size={52} color={colors.white} strokeWidth={2} />
          </Animated.View>
        </View>
        <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.word}>
          STOPPER
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={styles.tag}>
          {tagline}
        </Animated.Text>
      </View>

      <Dots />
    </View>
  );
}

function Dot({ i }: { i: number }) {
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withDelay(i * 200, withRepeat(withSequence(
      withTiming(1, { duration: 700 }),
      withTiming(0.3, { duration: 700 }),
    ), -1, false));
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.dot, s]} />;
}

function Dots() {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map(i => <Dot key={i} i={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#064634', overflow: 'hidden' },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140 },
  center: { alignItems: 'center' },
  markArea: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 104, height: 104, borderRadius: 32, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  mark: { width: 104, height: 104, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.26)' },
  word: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 46, letterSpacing: -1.8, color: colors.white, marginTop: 30 },
  tag: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 15.5, color: 'rgba(255,255,255,0.82)', marginTop: 12 },
  dots: { position: 'absolute', bottom: 64, flexDirection: 'row', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
});
