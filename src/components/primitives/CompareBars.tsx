import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

interface CompareBarsProps {
  you: number;
  avg: number;
}

function Bar({ value, label, color, glowColor, delay = 0 }: {
  value: number;
  label: string;
  color: string;
  glowColor: string;
  delay?: number;
}) {
  const H = 230;
  const height = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(height, {
      toValue: (value / 100) * H,
      duration: 1000,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.barCol}>
      <View style={[styles.barTrack, { height: H }]}>
        <Animated.View
          style={[
            styles.barFill,
            {
              height,
              backgroundColor: color,
              shadowColor: glowColor,
            },
          ]}
        >
          <Text style={styles.barValue}>{value}%</Text>
        </Animated.View>
      </View>
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
}

export function CompareBars({ you, avg }: CompareBarsProps) {
  return (
    <View style={styles.container}>
      <Bar value={you} label="Your score" color={colors.coral500} glowColor={colors.coral500} delay={120} />
      <Bar value={avg} label="Average" color={colors.jade500} glowColor={colors.jade500} delay={120} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 22,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  barTrack: {
    width: '100%',
    maxWidth: 110,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    paddingTop: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  barValue: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 26,
    color: colors.white,
  },
  barLabel: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.fgMuted,
    fontWeight: '500',
  },
});
