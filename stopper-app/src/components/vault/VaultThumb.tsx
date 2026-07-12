// components/vault/VaultThumb.tsx
// Private, calm video thumbnail — jade gradient + DAY stamp + play glyph.
// Uses the real thumbnail when available, gradient placeholder otherwise.
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import { colors } from '../../constants/colors';

type Props = { day: number; thumbUri?: string; size?: number; radius?: number; onPress?: () => void };

export function VaultThumb({ day, thumbUri, size = 72, radius = 14, onPress }: Props) {
  const h = Math.round(size * 1.25); // portrait
  const body = (
    <View style={[styles.wrap, { width: size, height: h, borderRadius: radius }]}>
      {thumbUri ? (
        <Image source={{ uri: thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient colors={['#0F9468', '#0A5C42', '#073D2D']} start={{ x: 0.3, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      )}
      <Text style={styles.day}>DAY {day}</Text>
      <View style={styles.play}><Play size={13} color={colors.white} /></View>
    </View>
  );
  if (!onPress) return body;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Play message from day ${day}`}>{body}</Pressable>;
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  day: { position: 'absolute', top: 7, left: 8, fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6, color: 'rgba(255,255,255,0.75)' },
  play: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
});
