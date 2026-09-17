import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeInDown, Easing, useReducedMotion,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
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
  const reduceMotion = useReducedMotion();

  // The shield breathes. It's the brand mark and the only thing on the screen
  // that isn't a button, so it carries the whole first impression — a still
  // icon on a black field reads as a loading state.
  const breathe = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ), -1, false);
  }, [reduceMotion, breathe]);

  const shieldStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + breathe.value * 0.045 }] }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + breathe.value * 0.4,
    transform: [{ scale: 0.92 + breathe.value * 0.16 }],
  }));

  /** Entrance timings — one cascade down the screen, then it settles. */
  const enter = (delay: number) =>
    reduceMotion ? undefined : FadeInDown.delay(delay).duration(520);

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
        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(600)}>
          <Wordmark size={26} />
        </Animated.View>
      </View>

      <View style={styles.hero}>
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.delay(140).duration(700)}
          style={styles.shieldWrap}
        >
          <Animated.View pointerEvents="none" style={[styles.shieldGlow, glowStyle]} />
          <Animated.View style={shieldStyle}>
            <ShieldCheck size={50} color={colors.jade400} strokeWidth={2} />
          </Animated.View>
        </Animated.View>
        <Animated.Text entering={enter(260)} style={styles.h1}>Start your recovery</Animated.Text>
        <Animated.Text entering={enter(340)} style={styles.sub}>
          You can use Stopper without an account. Sign up only if you want your
          progress backed up across devices, or to join the community.
        </Animated.Text>
      </View>

      <View style={styles.actions}>
        {onApple && (
          <Animated.View entering={enter(460)}>
            <SocialButton provider="apple" label="Continue with Apple" onPress={onApple} loading={loading} />
          </Animated.View>
        )}
        <Animated.View entering={enter(520)}>
          <SocialButton provider="google" label="Continue with Google" onPress={onGoogle} loading={loading} />
        </Animated.View>
        <Animated.View entering={enter(580)}>
          <PrimaryButton icon={<Mail size={20} color={colors.white} strokeWidth={2} />} onPress={onEmail}>
            Sign up with email
          </PrimaryButton>
        </Animated.View>

        {onContinueAsGuest && (
          <Animated.View entering={enter(660)} style={styles.guestGroup}>
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
          </Animated.View>
        )}

        <Animated.View entering={enter(740)} style={styles.signinRow}>
          <Text style={styles.muted}>Already have an account? </Text>
          <Pressable onPress={onSignIn} hitSlop={12}><Text style={styles.link}>Sign in</Text></Pressable>
        </Animated.View>
        <Animated.Text entering={enter(800)} style={styles.legal}>
          By continuing you agree to our Terms &amp; Conditions and Privacy Policy.
        </Animated.Text>
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
  shieldWrap: { alignItems: 'center', justifyContent: 'center' },
  shieldGlow: {
    position: 'absolute',
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: colors.accentGlowSoft,
  },
  guestGroup: { gap: 11 },
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
