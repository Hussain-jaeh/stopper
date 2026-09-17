import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, Mail, X } from 'lucide-react-native';
import { PrimaryButton, Wordmark, DotTexture } from '../../components/primitives';
import { SocialButton } from '../components/SocialButton';
import { OrDivider } from '../components/OrDivider';
import { colors, fonts, radii } from '../../theme/tokens';

interface Props {
  onApple?: () => void;
  onGoogle: () => void;
  onEmail: () => void;
  onSignIn: () => void;
  /**
   * Guest mode. Registration is optional in Stopper — everything except the
   * community works without an account, including subscribing. Presented as a
   * full-width button of equal weight to the sign-up options, not a hidden link.
   */
  onContinueAsGuest?: () => void;
  /** Shown only when this screen was opened from inside the app. */
  onCancel?: () => void;
  loading?: boolean;
}

export function AuthLandingScreen({
  onApple,
  onGoogle,
  onEmail,
  onSignIn,
  onContinueAsGuest,
  onCancel,
  loading,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <DotTexture />
      <View style={styles.top}>
        {onCancel && (
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
            style={styles.close}
          >
            <X size={18} color={colors.fgMuted} />
          </Pressable>
        )}
        <Wordmark size={26} />
      </View>

      <View style={styles.hero}>
        <ShieldCheck size={50} color={colors.jade400} strokeWidth={2} />
        <Text style={styles.h1}>Start your recovery</Text>
        <Text style={styles.sub}>
          You can use Stopper without an account. Sign up only if you want your
          progress backed up across devices, or to join the community.
        </Text>
      </View>

      <View style={styles.actions}>
        {onApple && <SocialButton provider="apple" label="Continue with Apple" onPress={onApple} loading={loading} />}
        <SocialButton provider="google" label="Continue with Google" onPress={onGoogle} loading={loading} />
        <PrimaryButton icon={<Mail size={20} color={colors.white} strokeWidth={2} />} onPress={onEmail}>
          Sign up with email
        </PrimaryButton>

        {onContinueAsGuest && (
          <>
            <OrDivider />
            <Pressable
              onPress={onContinueAsGuest}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Continue without an account"
              style={({ pressed }) => [styles.guestBtn, pressed && styles.guestBtnPressed]}
            >
              <Text style={styles.guestLabel}>Continue without an account</Text>
            </Pressable>
            <Text style={styles.guestNote}>No email, no password, nothing personal asked.</Text>
          </>
        )}

        <View style={styles.signinRow}>
          <Text style={styles.muted}>Already have an account? </Text>
          <Pressable onPress={onSignIn} hitSlop={12}><Text style={styles.link}>Sign in</Text></Pressable>
        </View>
        <Text style={styles.legal}>By continuing you agree to our Terms & Conditions and Privacy Policy.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, paddingBottom: 26 },
  top: { alignItems: 'center', paddingTop: 10, justifyContent: 'center' },
  close: {
    position: 'absolute', left: 0, top: 4,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: fonts.display, fontWeight: '800', fontSize: 30, color: colors.white, letterSpacing: -0.3, marginTop: 20 },
  sub: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 23, textAlign: 'center', marginTop: 12, maxWidth: 300 },
  actions: { gap: 11 },
  guestBtn: {
    height: 54,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.26)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnPressed: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.09)' },
  guestLabel: { fontFamily: fonts.ui, fontSize: 16, fontWeight: '700', color: colors.white },
  guestNote: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.fgFaint, textAlign: 'center', marginTop: -3 },
  signinRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  muted: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.fgMuted },
  link: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.jade300, fontWeight: '700' },
  legal: { fontFamily: fonts.ui, fontSize: 11.5, color: colors.fgFaint, textAlign: 'center', lineHeight: 17, marginTop: 6, marginHorizontal: 10 },
});
