import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { TrendingUp } from 'lucide-react-native';
import { colors, gradients } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

type Props = { trend: number[]; index?: number };

function Bar({ value, last, i }: { value: number; last: boolean; i: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(i * 30, withTiming(value, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [value]);
  const style = useAnimatedStyle(() => ({ height: `${h.value}%` as any }));
  return (
    <View style={styles.barCol}>
      <Animated.View style={[styles.bar, style, !last && { backgroundColor: colors.surface3 }]}>
        {last && <LinearGradient colors={gradients.primary} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={StyleSheet.absoluteFill} />}
      </Animated.View>
    </View>
  );
}

export function TrendChart({ trend, index = 4 }: Props) {
  const delta = trend[trend.length - 1] - trend[0];
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.card}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Resistance score</Text>
          <Text style={styles.sub}>How well you're beating cravings</Text>
        </View>
        <View style={styles.badge}>
          <TrendingUp size={15} color={colors.jade300} />
          <Text style={styles.badgeTxt}>{delta >= 0 ? '+' : ''}{delta}</Text>
        </View>
      </View>
      <View style={styles.chart}>
        {trend.map((v, i) => <Bar key={i} value={v} last={i === trend.length - 1} i={i} />)}
      </View>
      <View style={styles.axis}>
        <Text style={styles.axisTxt}>14 weeks ago</Text>
        <Text style={styles.axisTxt}>Now</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { ...type.cardTitle, color: colors.white },
  sub: { fontSize: 12.5, color: colors.textMuted, marginTop: 3 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(20,184,136,0.12)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  badgeTxt: { fontSize: 13, fontWeight: '700', color: colors.jade300 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 130, marginTop: 18 },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { borderRadius: 6, overflow: 'hidden', backgroundColor: colors.jade500 },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  axisTxt: { fontSize: 11.5, color: colors.textFaint },
});
