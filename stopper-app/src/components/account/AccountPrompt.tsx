// components/account/AccountPrompt.tsx
// One-time, dismissible offer to turn a guest session into a real account.
// Shown only at moments where the user has just made something worth keeping —
// never on a timer, never twice. Registration stays optional everywhere.
import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShieldCheck } from 'lucide-react-native';
import { colors, gradients } from '../../constants/colors';
import { shadow } from '../../constants/spacing';

export type AccountPromptId = 'first-vault' | 'streak-milestone';

const COPY: Record<AccountPromptId, { title: (n?: number) => string; body: string }> = {
  'first-vault': {
    title: () => 'Keep this message safe',
    body: "Right now this recording is tied to this phone alone. A free account means you keep it if the phone is lost or replaced, and can watch it from any device you sign in on.",
  },
  'streak-milestone': {
    title: (n) => (n ? `${n} days is worth protecting` : 'Worth protecting'),
    body: 'Your streak is tied to this phone alone right now. A free account means you keep it if anything happens to the phone, and carries your subscription to your other devices.',
  },
};

export function AccountPrompt({
  visible,
  promptId,
  day,
  onCreateAccount,
  onDismiss,
}: {
  visible: boolean;
  promptId: AccountPromptId;
  day?: number;
  onCreateAccount: () => void;
  onDismiss: () => void;
}) {
  const copy = COPY[promptId];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.scrim}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.sheet}>
          <View style={styles.icon}>
            <ShieldCheck size={26} color={colors.jade400} strokeWidth={2} />
          </View>
          <Text style={styles.h}>{copy.title(day)}</Text>
          <Text style={styles.p}>{copy.body}</Text>

          <Pressable
            onPress={onCreateAccount}
            accessibilityRole="button"
            style={[{ width: '100%', marginTop: 22 }, shadow.cta]}
          >
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaTxt}>Create a free account</Text>
            </LinearGradient>
          </Pressable>

          {/* Dismissal is a real option, stated plainly — this offer is made
              once and never returns. */}
          <Pressable onPress={onDismiss} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipTxt}>Not now</Text>
          </Pressable>
          <Text style={styles.fine}>You can do this any time from Profile.</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(6,10,9,0.72)', justifyContent: 'flex-end', padding: 16 },
  sheet: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(20,184,136,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  h: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 21, color: colors.white, marginTop: 16, textAlign: 'center' },
  p: { fontSize: 14.5, color: colors.textMuted, marginTop: 12, lineHeight: 21, textAlign: 'center' },
  cta: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  ctaTxt: { fontSize: 15.5, fontWeight: '800', color: colors.onAccent },
  skip: { alignItems: 'center', padding: 8, marginTop: 4 },
  skipTxt: { fontSize: 14.5, fontWeight: '600', color: colors.textMuted },
  fine: { fontSize: 12.5, color: colors.textFaint, marginTop: 2, textAlign: 'center' },
});
