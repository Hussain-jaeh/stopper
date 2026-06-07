import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows } from '../../theme/tokens';

interface StreakCardProps {
  days?: number;
  since?: string;
  reveal?: boolean;
}

export function StreakCard({ days = 0, since = '06/07/2026', reveal }: StreakCardProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reveal) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [reveal]);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }], opacity }, shadows.card]}>
      {/* Mesh gradient simulation — four overlapping views */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#c2541d', borderRadius: radii.xl }]} />
      <View style={[StyleSheet.absoluteFill, styles.meshTeal, { borderRadius: radii.xl }]} />
      <View style={[StyleSheet.absoluteFill, styles.meshBlue, { borderRadius: radii.xl }]} />
      <View style={[StyleSheet.absoluteFill, styles.meshOrange, { borderRadius: radii.xl }]} />

      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>STP</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>★ MEMBER</Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakBlock}>
          <Text style={styles.activeLabel}>ACTIVE STREAK</Text>
          <Text style={styles.daysText}>
            {days} <Text style={styles.daysSuffix}>days</Text>
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.sinceLabel}>FREE SINCE</Text>
          <Text style={styles.sinceDate}>{since}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 268,
    aspectRatio: 0.8,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  meshTeal: {
    backgroundColor: 'rgba(43,182,196,0.55)',
    opacity: 0.7,
  },
  meshBlue: {
    backgroundColor: 'rgba(46,125,209,0.3)',
    top: '20%',
    right: 0,
    bottom: '40%',
    left: '50%',
  },
  meshOrange: {
    backgroundColor: 'rgba(224,88,31,0.5)',
    top: '55%',
    bottom: 0,
    left: 0,
    right: '30%',
  },
  inner: {
    ...StyleSheet.absoluteFill,
    padding: 22,
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  monogram: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: -0.4,
    color: colors.white,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.white,
  },
  streakBlock: {
    marginTop: 'auto',
  },
  activeLabel: {
    fontSize: 12,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
    opacity: 0.9,
    color: colors.white,
  },
  daysText: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 56,
    lineHeight: 64,
    color: colors.white,
    marginTop: 4,
  },
  daysSuffix: {
    fontSize: 22,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  sinceLabel: {
    fontSize: 10,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    opacity: 0.85,
    color: colors.white,
  },
  sinceDate: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 18,
    color: colors.white,
  },
});
