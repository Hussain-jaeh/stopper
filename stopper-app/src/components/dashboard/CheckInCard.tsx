import React from 'react';
import { Text, StyleSheet, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';
import { Check, CircleCheckBig } from 'lucide-react-native';
import { colors, gradients } from '../../constants/colors';
import { radius, shadow } from '../../constants/spacing';
import { type } from '../../constants/typography';

const APress = Animated.createAnimatedComponent(Pressable);

type Props = { done: boolean; onCheckIn: () => void; onRelapse: () => void; index?: number };

export function CheckInCard({ done, onCheckIn, onRelapse, index = 5 }: Props) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (done) {
    return (
      <View style={{ gap: 10 }}>
        <View style={styles.doneCard}>
          <View style={styles.doneIcon}>
            <Check size={22} color={colors.onAccent} strokeWidth={3} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.doneTitle}>Today's check-in complete</Text>
            <Text style={styles.doneSub}>See you tomorrow — keep the streak alive.</Text>
          </View>
        </View>
        <Pressable onPress={onRelapse} accessibilityRole="button" accessibilityLabel="I slipped up" style={styles.relapseBtn}>
          <Text style={styles.relapseTxt}>I slipped up — log & restart</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <APress
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 120 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
        onPress={onCheckIn}
        accessibilityRole="button"
        accessibilityLabel="Check in today"
        style={[aStyle, shadow.cta]}
      >
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
          <CircleCheckBig size={22} color={colors.white} />
          <Text style={styles.ctaText}>Check in today</Text>
        </LinearGradient>
      </APress>
      <Pressable onPress={onRelapse} accessibilityRole="button" accessibilityLabel="I slipped up" style={styles.relapseBtn}>
        <Text style={styles.relapseTxt}>I slipped up — log & restart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cta: { height: 60, borderRadius: radius.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaText: { ...type.button, color: colors.white, fontWeight: '700' },
  doneCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: radius.card,
    backgroundColor: 'rgba(20,184,136,0.08)', borderWidth: 1, borderColor: 'rgba(20,184,136,0.35)',
  },
  doneIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.jade500, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { ...type.body, fontWeight: '700', color: colors.white },
  doneSub: { ...type.label, color: colors.textMuted, marginTop: 2 },
  relapseBtn: { alignItems: 'center', paddingVertical: 10 },
  relapseTxt: { fontSize: 13.5, color: colors.textFaint, textDecorationLine: 'underline' },
});
