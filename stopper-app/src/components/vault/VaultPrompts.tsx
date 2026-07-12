// components/vault/VaultPrompts.tsx
// CravingVaultPrompt — surfaces the latest message at the START of a craving/panic flow.
// MilestoneRecordPrompt — gentle bottom sheet inviting a reflection at milestones.
import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Play, Video } from 'lucide-react-native';
import { VaultThumb } from './VaultThumb';
import { Recording } from './FutureYouCard';
import { colors, gradients } from '../../constants/colors';
import { radius, shadow, spacing } from '../../constants/spacing';

/* ---- Craving flow interstitial (a step, not a modal) ---- */
export function CravingVaultPrompt({ latest, onWatch, onSkip }: {
  latest: Recording; onWatch: () => void; onSkip: () => void;
}) {
  return (
    <View style={styles.cravingRoot}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <VaultThumb day={latest.day} thumbUri={latest.thumbUri} size={84} radius={18} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ alignItems: 'center' }}>
        <Text style={styles.cravingH}>Before we continue —{'\n'}your past self left you this.</Text>
        <Text style={styles.cravingP}>"{latest.title}" · recorded on day {latest.day}</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(160).duration(500)} style={{ width: '100%', marginTop: 24, gap: 8 }}>
        <Pressable onPress={onWatch} accessibilityRole="button" style={shadow.cta}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            <Play size={18} color={colors.onAccent} />
            <Text style={styles.ctaTxt}>Watch My Message</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={onSkip} accessibilityRole="button" style={styles.skip}>
          <Text style={styles.skipTxt}>Continue Without Watching</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/* ---- Milestone bottom sheet ---- */
export function MilestoneRecordPrompt({ visible, day, onRecord, onLater }: {
  visible: boolean; day: number; onRecord: () => void; onLater: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.scrim}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.sheet}>
          <View style={styles.sheetIcon}><Video size={26} color={colors.jade400} /></View>
          <Text style={styles.sheetH}>{day} days. Take a moment.</Text>
          <Text style={styles.sheetP}>You know something today that day-one you didn't. Want to tell the next version of you about it?</Text>
          <Pressable onPress={onRecord} accessibilityRole="button" style={[{ width: '100%', marginTop: 22 }, shadow.cta]}>
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
              <Video size={17} color={colors.onAccent} />
              <Text style={styles.ctaTxt}>Record a reflection</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onLater} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipTxt}>Maybe later</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cravingRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 24, backgroundColor: colors.bg },
  cravingH: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 23, lineHeight: 28, color: colors.white, textAlign: 'center', marginTop: 18 },
  cravingP: { fontSize: 14.5, color: colors.textMuted, marginTop: 12, lineHeight: 21, textAlign: 'center' },
  cta: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  ctaTxt: { fontSize: 15.5, fontWeight: '800', color: colors.onAccent },
  skip: { alignItems: 'center', padding: 8 },
  skipTxt: { fontSize: 14.5, fontWeight: '600', color: colors.textMuted },
  scrim: { flex: 1, backgroundColor: 'rgba(6,10,9,0.72)', justifyContent: 'flex-end', padding: 16 },
  sheet: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 24, alignItems: 'center' },
  sheetIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(20,184,136,0.14)', alignItems: 'center', justifyContent: 'center' },
  sheetH: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 21, color: colors.white, marginTop: 16, textAlign: 'center' },
  sheetP: { fontSize: 14.5, color: colors.textMuted, marginTop: 12, lineHeight: 21, textAlign: 'center' },
});
