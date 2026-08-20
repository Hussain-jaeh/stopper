// Auto-prompt shown when isShareMilestone(days) becomes true.
// Confetti + flame, "Share my progress" → opens ShareSheet. Never blocks; "Maybe later" dismisses.
import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, AccessibilityInfo } from 'react-native';
import Animated, {
  FadeIn, useSharedValue, useAnimatedStyle,
  withTiming, withRepeat, withSequence, withDelay, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2 } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { type as T } from '../../constants/typography';
import { RootStackParamList } from '../../navigation/TabNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'MilestoneCelebration'>;

const CONFETTI_COLORS = ['#14B888', '#2DD4A0', '#6FE9C6', '#FFD700', '#FF6B4A', '#ffffff', '#2E7DD1'];

function ConfettiPiece({ x, delay, color, size, screenH }: {
  x: number; delay: number; color: string; size: number; screenH: number;
}) {
  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    ty.value = withDelay(delay, withTiming(screenH + 40, { duration: 2000 + Math.random() * 800, easing: Easing.out(Easing.quad) }));
    tx.value = withDelay(delay, withTiming(drift, { duration: 2000, easing: Easing.inOut(Easing.ease) }));
    rot.value = withDelay(delay, withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * 3, { duration: 2400 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { translateX: tx.value }, { rotate: `${rot.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{
      position: 'absolute', top: -20, left: x,
      width: size, height: size * 0.45,
      borderRadius: 2, backgroundColor: color,
    }, style]} />
  );
}

const PIECES = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: Math.random() * 300,
  size: 6 + Math.random() * 8,
}));

export function MilestoneCelebration() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { days, ...rest } = params;
  const { width, height } = useWindowDimensions();

  const flick = useSharedValue(0);
  const reduce = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(r => {
      reduce.current = r;
      if (!r) flick.value = withRepeat(withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })), -1);
    });
  }, []);
  const flame = useAnimatedStyle(() => ({ transform: [{ rotate: `${-3 + flick.value * 6}deg` }, { scale: 1 + flick.value * 0.08 }] }));

  const onShare = () => navigation.replace('ShareSheet', { days, ...rest });
  const onClose = () => navigation.goBack();

  return (
    <LinearGradient colors={['#0d3a2e', '#0B0B0B']} locations={[0, 0.62]} style={styles.fill}>
      {!reduce.current && PIECES.map(p => (
        <ConfettiPiece
          key={p.id}
          x={Math.random() * width}
          delay={p.delay}
          color={p.color}
          size={p.size}
          screenH={height}
        />
      ))}
      <View style={styles.center}>
        <Animated.Text entering={FadeIn.duration(500)} style={[{ fontSize: 96 }, flame]}>🔥</Animated.Text>
        <Text style={styles.kick}>MILESTONE REACHED</Text>
        <Text style={styles.h1}>{days} days free!</Text>
        <Text style={styles.sub}>That's {days} days of choosing you. This one's worth sharing.</Text>
        <Pressable onPress={onShare} style={{ width: '100%', maxWidth: 320, marginTop: spacing.xl }}>
          <LinearGradient colors={['#14B888', '#2DD4A0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Share2 size={20} color={colors.onAccent} />
            <Text style={styles.ctaTxt}>Share my progress</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={onClose} style={{ padding: 12 }}><Text style={styles.later}>Maybe later</Text></Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  kick: { fontSize: 13, letterSpacing: 2.6, fontWeight: '800', color: colors.jade300, marginTop: 18, textTransform: 'uppercase' },
  h1: { ...T.h1, fontSize: 40, color: colors.white, marginTop: 12 },
  sub: { fontSize: 17, color: colors.textMuted, lineHeight: 24, textAlign: 'center', marginTop: 14, paddingHorizontal: 24 },
  cta: { height: 58, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaTxt: { color: colors.onAccent, fontSize: 17, fontWeight: '800' },
  later: { color: colors.textMuted, fontSize: 16, fontWeight: '600', marginTop: 6 },
});
