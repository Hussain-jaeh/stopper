import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ShieldCheck, Mail } from 'lucide-react-native';
import { PrimaryButton, Wordmark, DotTexture } from '../../components/primitives';
import { SocialButton } from '../components/SocialButton';
import { OrDivider } from '../components/OrDivider';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  onApple: () => void;
  onGoogle: () => void;
  onEmail: () => void;
  onSignIn: () => void;
}

export function AuthLandingScreen({ onApple, onGoogle, onEmail, onSignIn }: Props) {
  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={styles.top}><Wordmark size={26} /></View>

      <View style={styles.hero}>
        <ShieldCheck size={50} color={colors.jade400} strokeWidth={2} />
        <Text style={styles.h1}>Save your progress</Text>
        <Text style={styles.sub}>Create a free account so your plan, streak and check-ins are never lost.</Text>
      </View>

      <View style={styles.actions}>
        <SocialButton provider="apple" label="Continue with Apple" onPress={onApple} />
        <SocialButton provider="google" label="Continue with Google" onPress={onGoogle} />
        <OrDivider />
        <PrimaryButton icon={<Mail size={20} color={colors.white} strokeWidth={2} />} onPress={onEmail}>
          Sign up with email
        </PrimaryButton>
        <View style={styles.signinRow}>
          <Text style={styles.muted}>Already have an account? </Text>
          <Pressable onPress={onSignIn}><Text style={styles.link}>Sign in</Text></Pressable>
        </View>
        <Text style={styles.legal}>By continuing you agree to our Terms & Conditions and Privacy Policy.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 26 },
  top: { alignItems: 'center', paddingTop: 10 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: fonts.display, fontWeight: '800', fontSize: 30, color: colors.white, letterSpacing: -0.3, marginTop: 20 },
  sub: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 23, textAlign: 'center', marginTop: 12, maxWidth: 290 },
  actions: { gap: 11 },
  signinRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  muted: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.fgMuted },
  link: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.jade300, fontWeight: '700' },
  legal: { fontFamily: fonts.ui, fontSize: 11.5, color: colors.fgFaint, textAlign: 'center', lineHeight: 17, marginTop: 6, marginHorizontal: 10 },
});
