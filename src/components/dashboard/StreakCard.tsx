import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../constants/colors';
import { radius, spacing, shadow } from '../../constants/spacing';
import { type } from '../../constants/typography';

type Props = {
  current: number;
  daysSinceQuit: number;
  longest: number;
  addictionType: string;
  index?: number;
};

const STATS = [
  { key: 'current', label: 'Current' },
  { key: 'days', label: 'Days free' },
  { key: 'longest', label: 'Longest' },
] as const;

export function StreakCard({ current, daysSinceQuit, longest, addictionType }: Props) {
  const values = { current, days: daysSinceQuit, longest };

  return (
    <View
      style={[shadow.hero, styles.shadow]}
      accessibilityRole="summary"
      accessibilityLabel={`Current streak ${current} days. ${daysSinceQuit} days free. Longest streak ${longest} days.`}
    >
      <LinearGradient
        colors={gradients.streakHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* subtle inner top-edge highlight */}
        <View style={styles.topSheen} />

        <View style={styles.headRow}>
          <View style={styles.fireWrap}>
            <Text style={styles.fireEmoji}>🔥</Text>
          </View>
          <View style={styles.titleBlock}>
            <View style={styles.bigRow}>
              <Text style={styles.big}>{current}</Text>
              <Text style={styles.bigUnit}>day streak</Text>
            </View>
            <Text style={styles.sub}>{addictionType}-free and counting</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {STATS.map(({ key, label }, i) => (
            <React.Fragment key={key}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.statPill}>
                <Text style={styles.statValue}>{values[key]}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.hero,
    backgroundColor: '#11A074',
  },
  card: {
    borderRadius: radius.hero,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireWrap: {
    width: 58,
    height: 58,
    borderRadius: radius.card,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireEmoji: {
    fontSize: 30,
    lineHeight: 34,
  },
  titleBlock: {
    marginLeft: spacing.md,
    flex: 1,
  },
  bigRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  big: {
    ...type.display,
    fontSize: 56,
    color: colors.white,
    lineHeight: 56,
  },
  bigUnit: {
    ...type.button,
    fontSize: 20,
    color: colors.white,
    opacity: 0.95,
  },
  sub: {
    ...type.label,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  divider: {
    width: 0,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    borderTopColor: 'rgba(255,255,255,0.48)',
  },
  statValue: {
    ...type.statValue,
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 3,
    letterSpacing: 0.2,
  },
});
