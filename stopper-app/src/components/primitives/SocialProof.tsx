import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

export function Laurel({ size = 26 }: { size?: number }) {
  return (
    <View style={styles.laurelRow}>
      <Text style={{ fontSize: size }}>🌿</Text>
      <Text style={{ color: colors.meshYellow, fontSize: size * 0.82, letterSpacing: 2 }}>★★★★★</Text>
      <Text style={{ fontSize: size }}>🌿</Text>
    </View>
  );
}

export function PressRow() {
  return (
    <View style={styles.pressRow}>
      <Text style={[styles.pressItem, { fontStyle: 'italic', fontSize: 17 }]}>Forbes</Text>
      <Text style={[styles.pressItem, { fontWeight: '800', fontSize: 14, letterSpacing: 0.6 }]}>TECH TIMES</Text>
      <Text style={[styles.pressItem, { fontStyle: 'italic', fontSize: 15 }]}>LA WEEKLY</Text>
    </View>
  );
}

export function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === active ? 9 : 7,
              height: i === active ? 9 : 7,
              backgroundColor: i === active ? colors.white : 'rgba(255,255,255,0.28)',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  laurelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    opacity: 0.82,
  },
  pressItem: {
    fontFamily: fonts.ui,
    color: '#cfcfcf',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    borderRadius: 999,
  },
});
