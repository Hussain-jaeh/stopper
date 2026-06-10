import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, DotTexture, CircleBack } from '../../components/primitives';
import { AuthField } from '../components/AuthField';
import { SocialButton } from '../components/SocialButton';
import { OrDivider } from '../components/OrDivider';
import { AuthState, isValidEmail, isValidPassword } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  state: AuthState;
  setState: (patch: Partial<AuthState>) => void;
  onBack: () => void;
  onNext: () => void;
  onSignIn: () => void;
  error?: string;
  loading?: boolean;
}

export function SignUpScreen({ state, setState, onBack, onNext, onSignIn, error, loading }: Props) {
  const [touched, setTouched] = React.useState(false);
  const insets = useSafeAreaInsets();
  const emailOk = isValidEmail(state.email);
  const pwOk = isValidPassword(state.password);
  const valid = emailOk && pwOk;

  const submit = () => (valid ? onNext() : setTouched(true));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <DotTexture />
      <View style={styles.header}><CircleBack onBack={onBack} /></View>
      <View style={styles.intro}>
        <Text style={styles.h1}>Create your account</Text>
        <Text style={styles.sub}>One account keeps your recovery in sync everywhere.</Text>
      </View>
      <View style={styles.form}>
        <AuthField
          label="Email" value={state.email} onChangeText={v => setState({ email: v })}
          placeholder="you@email.com" keyboardType="email-address" autoFocus
          error={touched && !emailOk ? 'Enter a valid email address' : undefined}
        />
        <AuthField
          label="Password" value={state.password} onChangeText={v => setState({ password: v })}
          placeholder="At least 8 characters" secure
          error={touched && !pwOk ? 'Use at least 8 characters' : undefined}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={{ flex: 1 }} />
      <View style={styles.footer}>
        <PrimaryButton onPress={submit} disabled={touched && !valid} loading={loading}>Create account</PrimaryButton>
        <OrDivider />
        <View style={styles.socialRow}>
          <SocialButton provider="apple" label="Continue with Apple" onPress={onNext} loading={loading} />
          <SocialButton provider="google" label="Continue with Google" onPress={onNext} loading={loading} />
        </View>
        <View style={styles.signinRow}>
          <Text style={styles.muted}>Already have an account? </Text>
          <Pressable onPress={onSignIn}><Text style={styles.link}>Sign in</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, paddingBottom: 26 },
  header: { paddingVertical: 4 },
  intro: { paddingTop: 10 },
  h1: { fontFamily: fonts.display, fontWeight: '800', fontSize: 30, color: colors.white, letterSpacing: -0.3 },
  sub: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 23, marginTop: 12 },
  form: { marginTop: 26, gap: 16 },
  error: { fontFamily: fonts.ui, fontSize: 14, color: '#f87171' },
  footer: { gap: 12 },
  socialRow: { flexDirection: 'column', gap: 12 },
  signinRow: { flexDirection: 'row', justifyContent: 'center' },
  muted: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.fgMuted },
  link: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.jade300, fontWeight: '700' },
});
