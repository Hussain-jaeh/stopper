import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TINTS = ['#14B888', '#FF6B4A', '#2E7DD1', '#9B6FE4', '#F2B23E', '#2BB6C4'];

function hexA(hex: string, a: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function Avatar({ handle, size = 42, tint }: { handle: string; size?: number; tint?: string }) {
  const t = tint ?? TINTS[handle.charCodeAt(0) % TINTS.length];
  const initials = handle.replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase();
  return (
    <View style={[styles.av, { width: size, height: size, borderRadius: size / 2, backgroundColor: hexA(t, 0.22), borderColor: hexA(t, 0.4) }]}>
      <Text style={{ color: t, fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  av: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
