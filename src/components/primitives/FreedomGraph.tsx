import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, fonts } from '../../theme/tokens';

export function FreedomGraph() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 800,
      delay: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  const upPath = 'M0,118 C40,108 60,96 90,86 C120,76 150,70 190,52 C230,36 270,28 320,14';
  const downPath = 'M0,116 C40,104 70,108 100,98 C130,90 150,104 190,100 C230,96 270,116 320,134';

  return (
    <Animated.View style={{ opacity }}>
      <Svg viewBox="0 0 320 150" width="100%" height={150} style={{ display: 'flex' }}>
        <Defs>
          <LinearGradient id="upFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="rgba(20,184,136,0.32)" />
            <Stop offset="100%" stopColor="rgba(20,184,136,0)" />
          </LinearGradient>
        </Defs>
        <Path d={`${upPath} L320,150 L0,150 Z`} fill="url(#upFill)" />
        <Path d={downPath} fill="none" stroke="#F2622E" strokeWidth="3.5" strokeLinecap="round" />
        <Path d={upPath} fill="none" stroke="#14B888" strokeWidth="4" strokeLinecap="round" />
        <Circle cx="320" cy="14" r="7" fill="#14B888" stroke={colors.white} strokeWidth="2.5" />
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.jade500 }]} />
          <Text style={styles.legendText}>With Stopper</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.orange500 }]} />
          <Text style={styles.legendText}>Without</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  legendText: {
    fontFamily: fonts.ui,
    fontSize: 13.5,
    color: colors.fgMuted,
  },
});
