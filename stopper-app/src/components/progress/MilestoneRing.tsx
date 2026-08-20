import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

const ACircle = Animated.createAnimatedComponent(Circle);
const SIZE = 108, STROKE = 13, R = (SIZE - STROKE) / 2, C = 2 * Math.PI * R;

type Props = { cleanDays: number; nextMilestone: number; index?: number };

export function MilestoneRing({ cleanDays, nextMilestone, index = 1 }: Props) {
  const pct = Math.min(1, cleanDays / nextMilestone);
  const p = useSharedValue(0);
  useEffect(() => { p.value = withTiming(pct, { duration: 1100, easing: Easing.out(Easing.cubic) }); }, [pct]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - p.value) }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.card}>
      <View style={styles.ringWrap}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.jade500} />
              <Stop offset="1" stopColor={colors.jade400} />
            </LinearGradient>
          </Defs>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.surface3} strokeWidth={STROKE} fill="none" />
          <ACircle
            cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="url(#ring)" strokeWidth={STROKE} fill="none"
            strokeLinecap="round" strokeDasharray={C} animatedProps={animatedProps}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringNum}>{cleanDays}</Text>
          <Text style={styles.ringSub}>days clean</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>NEXT MILESTONE</Text>
        <Text style={styles.big}>{nextMilestone} days</Text>
        <Text style={styles.body}>
          {nextMilestone - cleanDays} days to go — you're {Math.round(pct * 100)}% there.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 20, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  ringWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  ringNum: { ...type.h1, fontSize: 32, color: colors.white },
  ringSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  eyebrow: { ...type.eyebrow, color: colors.jade300 },
  big: { ...type.h1, fontSize: 22, color: colors.white, marginVertical: 5 },
  body: { ...type.label, color: colors.textMuted, lineHeight: 19 },
});
