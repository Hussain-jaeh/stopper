import { useMemo, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme/tokens';

interface SparkleItem {
  top: number;
  left: number;
  size: number;
  jade: boolean;
  delay: number;
  duration: number;
}

function SparkleParticle({ item }: { item: SparkleItem }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(item.delay * 1000),
        Animated.timing(opacity, { toValue: 1, duration: (item.duration * 1000) / 2, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: (item.duration * 1000) / 2, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: `${item.top}%`,
        left: `${item.left}%`,
        width: item.size,
        height: item.size,
        borderRadius: item.size / 2,
        backgroundColor: item.jade ? colors.jade300 : colors.coral400,
        opacity,
      }}
    />
  );
}

export function Sparkles({ count = 14 }: { count?: number }) {
  const items = useMemo<SparkleItem[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 5 + 3,
        jade: i % 3 !== 0,
        delay: Math.random() * 2,
        duration: Math.random() * 1.6 + 1.4,
      })),
    [count]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((item, i) => (
        <SparkleParticle key={i} item={item} />
      ))}
    </View>
  );
}
