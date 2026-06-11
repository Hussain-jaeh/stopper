import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, gradients } from '../../constants/colors';
import { type } from '../../constants/typography';

export type CommunityTab = 'Feed' | 'Circles' | 'Leaders';

export function CommunityHeader({ tab, setTab, onlineCount, index = 0 }: {
  tab: CommunityTab; setTab: (t: CommunityTab) => void; onlineCount: number; index?: number;
}) {
  const tabs: CommunityTab[] = ['Feed', 'Circles', 'Leaders'];
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={{ gap: 16 }}>
      <View style={styles.row}>
        <View>
          <Text style={styles.h1}>Community</Text>
          <Text style={styles.sub}>You're never doing this alone.</Text>
        </View>
        <View style={styles.online} accessibilityLabel={`${onlineCount} people online`}>
          <View style={styles.dot} />
          <Text style={styles.onlineTxt}>{onlineCount.toLocaleString()} online</Text>
        </View>
      </View>
      <View style={styles.segment}>
        {tabs.map(t => {
          const on = t === tab;
          return (
            <Pressable key={t} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={styles.segItem}>
              {on && <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />}
              <Text style={[styles.segTxt, { color: on ? colors.onAccent : colors.textMuted }]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  h1: { ...type.h1, color: colors.white },
  sub: { ...type.label, color: colors.textMuted, marginTop: 6 },
  online: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(20,184,136,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.jade400 },
  onlineTxt: { fontSize: 13, fontWeight: '700', color: colors.jade300 },
  segment: { flexDirection: 'row', gap: 6, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 4 },
  segItem: { flex: 1, height: 38, borderRadius: 11, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  segTxt: { fontSize: 14, fontWeight: '700' },
});
