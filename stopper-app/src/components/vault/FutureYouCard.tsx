
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Video, Play } from 'lucide-react-native';
import { VaultThumb } from './VaultThumb';
import { colors, gradients } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

export type Recording = {
  id: string;
  title: string;
  day: number;          // recovery day when recorded
  date: string;         // display date, e.g. "Jul 10, 2026"
  duration: string;     // "0:48"
  videoUri?: string;    // storage URL
  thumbUri?: string;   
};

type Props = {
  latest?: Recording;   // undefined → empty state
  onRecord: () => void;
  onWatch: (r: Recording) => void;
  onViewAll: () => void;
  index?: number;
};

export function FutureYouCard({ latest, onRecord, onWatch, onViewAll, index = 5 }: Props) {
  if (!latest) {
    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.card}>
        <View style={styles.headRow}>
          <View style={styles.iconBadge}><Video size={21} color={colors.jade400} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Message to Future You</Text>
            <Text style={styles.sub}>Leave a message for the you who'll need it on a hard day.</Text>
          </View>
        </View>
        <Pressable onPress={onRecord} accessibilityRole="button" style={styles.emptyCta}>
          <Video size={18} color={colors.jade300} />
          <Text style={styles.emptyCtaTxt}>Record Your First Message</Text>
        </Pressable>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.card}>
      <View style={styles.titleRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Video size={17} color={colors.jade400} />
          <Text style={styles.titleSm}>Message to Future You</Text>
        </View>
        <Pressable onPress={onViewAll} accessibilityRole="button"><Text style={styles.viewAll}>View all ›</Text></Pressable>
      </View>
      <View style={styles.body}>
        <VaultThumb day={latest.day} thumbUri={latest.thumbUri} size={72} onPress={() => onWatch(latest)} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.recTitle} numberOfLines={1}>{latest.title}</Text>
          <Text style={styles.meta}>Day {latest.day} · {latest.date} · {latest.duration}</Text>
          <View style={styles.actions}>
            <Pressable onPress={() => onWatch(latest)} accessibilityRole="button" style={styles.watchWrap}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.watch}>
                <Play size={14} color={colors.onAccent} />
                <Text style={styles.watchTxt}>Watch</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={onRecord} accessibilityRole="button" style={styles.recordNew}>
              <Video size={14} color={colors.textMuted} />
              <Text style={styles.recordNewTxt}>Record new</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBadge: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(20,184,136,0.14)', alignItems: 'center', justifyContent: 'center' },
  title: { ...type.body, fontWeight: '700', color: colors.white },
  sub: { fontSize: 13.5, color: colors.textMuted, marginTop: 3, lineHeight: 19 },
  emptyCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 48, marginTop: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(20,184,136,0.4)', backgroundColor: 'rgba(20,184,136,0.10)' },
  emptyCtaTxt: { fontSize: 15, fontWeight: '700', color: colors.jade300 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  titleSm: { fontSize: 15.5, fontWeight: '700', color: colors.white },
  viewAll: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  body: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  recTitle: { fontSize: 15, fontWeight: '600', color: colors.white },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  watchWrap: { borderRadius: 999, overflow: 'hidden' },
  watch: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  watchTxt: { fontSize: 13, fontWeight: '700', color: colors.onAccent },
  recordNew: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  recordNewTxt: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
});
