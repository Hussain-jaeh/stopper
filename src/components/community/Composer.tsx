import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PenLine } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';

export function Composer({ myHandle, onPress, index = 1 }: { myHandle: string; onPress: () => void; index?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Create a post" style={styles.card}>
        <Avatar handle={myHandle} tint={colors.jade500} />
        <Text style={styles.prompt}>Share a win or ask for support…</Text>
        <View style={styles.pen}><PenLine size={18} color={colors.onAccent} /></View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  prompt: { flex: 1, fontSize: 15, color: colors.textMuted },
  pen: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.jade500 },
});
