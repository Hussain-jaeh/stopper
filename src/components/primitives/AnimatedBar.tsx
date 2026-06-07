import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

interface AnimatedBarProps {
  label: string;
  value: number;
  delay?: number;
}

export function AnimatedBar({ label, value, delay = 0 }: AnimatedBarProps) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(width, {
      toValue: value,
      duration: 900,
      delay: delay * 1000,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [value]);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <View style={styles.trackBg}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: width.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  value: {
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: '700',
    color: colors.jade300,
  },
  trackBg: {
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.jade500,
  },
});
