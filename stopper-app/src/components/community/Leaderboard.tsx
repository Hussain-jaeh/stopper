import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar } from './Avatar';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';

export type Leader = { handle: string; circle: string; streak: number; you?: boolean; rank?: number; checkIns?: number };

const MEDAL = ['#F2B23E', '#C7CCD1', '#CD7F4D'];

export function Leaderboard({ leaders }: { leaders: Leader[] }) {
  return (
    <View style={{ gap: 10 }}>
      {leaders.length === 0 && (
        <Text style={styles.circle}>Check in daily to get on the board.</Text>
      )}
      {leaders.map((l, i) => {
        const rank = l.rank ?? i + 1;
        return (
        <Animated.View key={l.handle + i}>
          <View style={[styles.row, l.you && styles.you]}>
            <Text style={[styles.rank, { color: rank <= 3 ? MEDAL[rank - 1] : colors.textFaint }]}>{rank}</Text>
            <Avatar handle={l.handle} size={40} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.handle}>
                {l.handle}{l.you ? <Text style={styles.youTag}> · You</Text> : null}
              </Text>
              <Text style={styles.circle}>
                {l.circle}{l.checkIns ? ` · ${l.checkIns} check-ins this month` : ''}
              </Text>
            </View>
            <Text style={styles.streak}>🔥 {l.streak}</Text>
          </View>
        </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 16 },
  you: { borderColor: colors.jade500, backgroundColor: 'rgba(20,184,136,0.08)' },
  rank: { width: 26, textAlign: 'center', fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 17 },
  handle: { fontWeight: '700', fontSize: 15, color: colors.white },
  youTag: { color: colors.jade300, fontWeight: '600' },
  circle: { fontSize: 12.5, color: colors.textFaint, marginTop: 1 },
  streak: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 17, color: '#FF8A6B' },
});
