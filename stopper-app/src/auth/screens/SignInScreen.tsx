import React from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  error?: string;
}

export function SignInScreen({ state, setState, onBack, onSignedIn, onForgot, onApple, onGoogle, loading, error }: Props) {
  const insets = useSafeAreaInsets();
  const [touched, setTouched] = React.useState(false);
  const emailOk = isValidEmail(state.email);
  const passwordOk = (state.password || '').length >= 1;

  const handlePress = () => {
    setTouched(true);
    if (emailOk && passwordOk) onSignedIn();
  };

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.screen, { paddingTop: insets.top + 10 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <DotTexture />
        <View style={styles.header}><CircleBack onBack={onBack} /></View>
        <View style={styles.intro}>
          <Text style={styles.h1}>Welcome back</Text>
          <Text style={styles.sub}>Pick up right where you left off.</Text>
        </View>
        <View style={styles.form}>
          <AuthField label="Email" value={state.email} onChangeText={v => setState({ email: v })}
            placeholder="you@email.com" keyboardType="email-address" autoFocus
            error={touched && !emailOk ? 'Enter a valid email address' : undefined} />
          <AuthField label="Password" value={state.password} onChangeText={v => setState({ password: v })}
            placeholder="Your password" secure
            error={touched && !passwordOk ? 'Enter your password' : undefined} />
          <Pressable onPress={onForgot} style={styles.forgot} hitSlop={12}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ flex: 1, minHeight: 32 }} />
        <View style={styles.footer}>
          <PrimaryButton icon={null} onPress={handlePress} loading={loading}>Sign in</PrimaryButton>
          <OrDivider />
          <View style={styles.socialRow}>
            {onApple && <SocialButton provider="apple" label="Continue with Apple" onPress={onApple} loading={loading} />}
            {onGoogle && <SocialButton provider="google" label="Continue with Google" onPress={onGoogle} loading={loading} />}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  screen: { flexGrow: 1, backgroundColor: colors.bg, paddingHorizontal: 24, paddingBottom: 26 },
  header: { paddingVertical: 4 },
  intro: { paddingTop: 10 },
  h1: { fontFamily: fonts.display, fontWeight: '800', fontSize: 30, color: colors.white, letterSpacing: -0.3 },
  sub: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 23, marginTop: 12 },
  form: { marginTop: 26, gap: 16 },
  forgot: { alignSelf: 'flex-end' },
  error: { fontFamily: fonts.ui, fontSize: 14, color: '#f87171', marginTop: 4 },
  footer: { gap: 14 },
  socialRow: { flexDirection: 'column', gap: 12
    
   },
  link: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.jade300, fontWeight: '700' },
});
