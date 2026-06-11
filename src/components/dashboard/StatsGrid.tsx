import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Trophy, Activity, CircleCheckBig, RotateCcw } from 'lucide-react-native';
import { StatCard } from './StatCard';
import { colors } from '../../constants/colors';

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
        <StatCard Icon={Trophy} label="Longest streak" value={`${longestStreak}d`} tint={colors.gold} />
        <StatCard Icon={Activity} label="Avg. craving" value={cravingAverage.toFixed(1)} tint={colors.coral500} />
      </View>
      <View style={styles.row}>
        <StatCard Icon={CircleCheckBig} label="Check-ins" value={totalCheckIns} tint={colors.jade500} />
        <StatCard Icon={RotateCcw} label="Relapses" value={totalRelapses} tint={colors.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 12 } });
