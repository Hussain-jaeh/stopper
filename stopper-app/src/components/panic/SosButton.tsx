import { useEffect } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { LifeBuoy } from 'lucide-react-native';
import { colors } from '../../constants/colors';

const APressable = Animated.createAnimatedComponent(Pressable);

export function SosButton({ onPress }: { onPress: () => void }) {
  const s = useSharedValue(1);

  useEffect(() => {
    s.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <APressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="I'm struggling — open SOS"
      style={[styles.btn, aStyle]}
    >
      <LinearGradient
        colors={['#FF8A6B', '#F2622E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fill}
      >
        <LifeBuoy size={24} color={colors.white} />
        <Text style={styles.label}>SOS</Text>
      </LinearGradient>
    </APressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 18,
    bottom: 96,
    zIndex: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    shadowColor: '#F2622E',
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  fill: { flex: 1, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 0.7, color: colors.white, marginTop: 1 },
});
