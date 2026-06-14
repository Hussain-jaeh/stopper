import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PrimaryButton, DotTexture, CircleBack } from '../../components/primitives';
import { AuthField } from '../components/AuthField';
import { SocialButton } from '../components/SocialButton';
import { OrDivider } from '../components/OrDivider';
import { AuthState, isValidEmail } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  state: AuthState;
  setState: (patch: Partial<AuthState>) => void;
  onBack: () => void;
  onSignedIn: () => void;
  onForgot: () => void;
  onApple?: () => void;
  onGoogle?: () => void;
  loading?: boolean;
}

export function SignInScreen({ state, setState, onBack, onSignedIn, onForgot, onApple, onGoogle, loading }: Props) {
  const valid = isValidEmail(state.email) && (state.password || '').length >= 1;

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={styles.header}><CircleBack onBack={onBack} /></View>
      <View style={styles.intro}>
        <Text style={styles.h1}>Welcome back</Text>
        <Text style={styles.sub}>Pick up right where you left off.</Text>
      </View>
      <View style={styles.form}>
        <AuthField label="Email" value={state.email} onChangeText={v => setState({ email: v })}
          placeholder="you@email.com" keyboardType="email-address" autoFocus />
        <AuthField label="Password" value={state.password} onChangeText={v => setState({ password: v })}
          placeholder="Your password" secure />
        <Pressable onPress={onForgot} style={styles.forgot}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }} />
      <View style={styles.footer}>
        <PrimaryButton icon={null} onPress={onSignedIn} disabled={!valid}>Sign in</PrimaryButton>
        <OrDivider />
        <View style={styles.socialRow}>
          {onApple && <SocialButton provider="apple" label="Continue with Apple" onPress={onApple} loading={loading} />}
          {onGoogle && <SocialButton provider="google" label="Continue with Google" onPress={onGoogle} loading={loading} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 26 },
  header: { paddingVertical: 4 },
  intro: { paddingTop: 10 },
  h1: { fontFamily: fonts.display, fontWeight: '800', fontSize: 30, color: colors.white, letterSpacing: -0.3 },
  sub: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 23, marginTop: 12 },
  form: { marginTop: 26, gap: 16 },
  forgot: { alignSelf: 'flex-end' },
  footer: { gap: 14 },
  socialRow: { flexDirection: 'column', gap: 12
    
   },
  link: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.jade300, fontWeight: '700' },
});
