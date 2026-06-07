import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme/tokens';

interface PulseHeroProps {
  icon: React.ReactNode;
  size?: number;
}

function PulseRing({ size, delay }: { size: number; delay: number }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.5, duration: 2000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: colors.jade400,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

export function PulseHero({ icon, size = 200 }: PulseHeroProps) {
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.04, duration: 2000, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const orbSize = size * 0.56;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1000, 2000].map((delay, i) => (
        <PulseRing key={i} size={size} delay={delay} />
      ))}
      <Animated.View
        style={{
          width: orbSize,
          height: orbSize,
          borderRadius: orbSize / 2,
          backgroundColor: colors.jade700,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: breathe }],
          shadowColor: colors.jade500,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 25,
        }}
      >
        {icon}
      </Animated.View>
    </View>
  );
}
