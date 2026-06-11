import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, fonts } from '../../theme/tokens';

interface RingProgressProps {
  value: number; // 0–1
  size?: number;
  stroke?: number;
  label?: number | string | null;
  sub?: string;
}

export function RingProgress({ value, size = 150, stroke = 11, label, sub }: RingProgressProps) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, value)));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#14B888" />
            <Stop offset="100%" stopColor="#2DD4A0" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {label != null && (
          <Text style={[styles.labelText, { fontSize: size * 0.26 }]}>{label}</Text>
        )}
        {sub ? <Text style={styles.subText}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  labelText: {
    fontFamily: fonts.display,
    fontWeight: '800',
    color: colors.white,
    lineHeight: undefined,
  },
  subText: {
    fontSize: 12,
    color: colors.fgMuted,
    fontFamily: fonts.ui,
  },
});
