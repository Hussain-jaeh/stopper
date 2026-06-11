import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MailCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, DotTexture, CircleBack } from '../../components/primitives';
import { AuthField } from '../components/AuthField';
import { AuthState, isValidEmail } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  state: AuthState;
  setState: (patch: Partial<AuthState>) => void;
  onBack: () => void;
  onDone: () => void;
  onSendReset?: () => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function ForgotPasswordScreen({ state, setState, onBack, onDone, onSendReset, loading, error }: Props) {
  const [sent, setSent] = React.useState(false);
  const insets = useSafeAreaInsets();
  const emailOk = isValidEmail(state.email);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <DotTexture />
      <View style={styles.header}><CircleBack onBack={onBack} /></View>

      {!sent ? (
        <>
          <View style={styles.intro}>
            <Text style={styles.h1}>Reset password</Text>
            <Text style={styles.sub}>Enter your email and we'll send you a reset link.</Text>
          </View>
          <View style={styles.form}>
            <AuthField label="Email" value={state.email} onChangeText={v => setState({ email: v })}
              placeholder="you@email.com" keyboardType="email-address" autoFocus />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          <View style={{ flex: 1 }} />
          <PrimaryButton icon={null} loading={loading} onPress={async () => { await onSendReset?.(); setSent(true); }} disabled={!emailOk}>
            Send reset link
          </PrimaryButton>
        </>
      ) : (
        <>
          <View style={styles.confirm}>
            <View style={styles.badge}><MailCheck size={38} color={colors.jade400} strokeWidth={2} /></View>
            <Text style={[styles.h1, { marginTop: 18 }]}>Check your email</Text>
            <Text style={[styles.sub, { textAlign: 'center', maxWidth: 280 }]}>
              We sent a reset link to <Text style={styles.strong}>{state.email}</Text>.
            </Text>
          </View>
          <PrimaryButton icon={null} onPress={onDone}>Back to sign in</PrimaryButton>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, paddingBottom: 26 },
  header: { paddingVertical: 4 },
  intro: { paddingTop: 10 },
  h1: { fontFamily: fonts.display, fontWeight: '800', fontSize: 30, color: colors.white, letterSpacing: -0.3 },
  sub: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 23, marginTop: 12 },
  strong: { color: colors.white, fontWeight: '600' },
  form: { marginTop: 26, gap: 12 },
  error: { fontFamily: fonts.ui, fontSize: 14, color: '#f87171' },
  confirm: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: 'rgba(20,184,136,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
});
