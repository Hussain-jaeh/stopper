import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, gradients } from '../../constants/colors';

const APressable = Animated.createAnimatedComponent(Pressable);

export function PanicCta({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      onPressIn={() => { s.value = withTiming(0.97, { duration: 120 }); }}
      onPressOut={() => { s.value = withTiming(1, { duration: 120 }); }}
      onPress={onClick}
      accessibilityRole="button"
      style={[styles.ctaShadow, a]}
    >
      <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
        <Text style={styles.ctaTxt}>{children}</Text>
      </LinearGradient>
    </APressable>
  );
}

export function TextButton({ children, onPress, danger }: {
  children: React.ReactNode;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.textBtn}>
      <Text style={[styles.textBtnTxt, danger && { color: colors.coral500 }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ctaShadow: {
    borderRadius: 32,
    shadowColor: colors.jade500,
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cta: { height: 56, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  ctaTxt: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: colors.white },
  textBtn: { height: 46, alignItems: 'center', justifyContent: 'center' },
  textBtnTxt: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
});
