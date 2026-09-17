import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from './StatCard';

type Props = {
  longestStreak: number;
  cravingAverage: number;
  totalCheckIns: number;
  totalRelapses: number;
  index?: number;
};

export function StatsGrid({ longestStreak, cravingAverage, totalCheckIns, totalRelapses, index = 3 }: Props) {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.row}>
        <StatCard sticker="bestStreak" label="Longest streak" value={`${longestStreak}d`} />
        <StatCard sticker="cravingAvg" label="Avg. craving" value={cravingAverage.toFixed(1)} />
      </View>
      <View style={styles.row}>
        <StatCard sticker="checkIn" label="Check-ins" value={totalCheckIns} />
        <StatCard sticker="relapseCount" label="Relapses" value={totalRelapses} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 12 } });
