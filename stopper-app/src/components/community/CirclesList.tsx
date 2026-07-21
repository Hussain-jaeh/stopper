import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';

export type Circle = {
  id: string;
  name: string;
  icon: LucideIcon;
  iconKey: string;
  tint: string;
  members: number;
  activity: string;
  joined: boolean;
};

function tintBg(hex: string, a = 0.18) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

export function CirclesList({ circles, onJoin, onOpen }: {
  circles: Circle[];
  onJoin: (id: string) => void;
  onOpen: (c: Circle) => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      {circles.map((c, i) => (
        <Animated.View key={c.id} entering={FadeInDown.delay((i + 1) * 70).duration(500)}>
          <Pressable style={styles.card} onPress={() => onOpen(c)} accessibilityRole="button" accessibilityLabel={`Open ${c.name}`}>
            <View style={[styles.icon, { backgroundColor: tintBg(c.tint) }]}>
              <c.icon size={23} color={c.tint} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.meta}>{c.members.toLocaleString()} members · {c.activity}</Text>
            </View>
            <Pressable
              onPress={(e) => { e.stopPropagation(); onJoin(c.id); }}
              accessibilityRole="button"
              accessibilityLabel={`${c.joined ? 'Leave' : 'Join'} ${c.name}`}
              style={[styles.btn, c.joined ? styles.btnJoined : styles.btnJoin]}
            >
              <Text style={[styles.btnTxt, { color: c.joined ? colors.jade300 : colors.onAccent }]}>
                {c.joined ? 'Joined' : 'Join'}
              </Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '700', fontSize: 16, color: colors.white },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  btn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999 },
  btnJoin: { backgroundColor: colors.jade500 },
  btnJoined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.jade500 },
  btnTxt: { fontSize: 13.5, fontWeight: '700' },
});
