import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/tokens';

export function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 34 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        jade: Math.random() > 0.85,
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: s.jade ? colors.jade400 : colors.white,
            opacity: s.opacity,
          }}
        />
      ))}
    </View>
  );
}
