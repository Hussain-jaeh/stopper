import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, DotTexture, CircleBack } from '../../components/primitives';
import { OtpInput } from '../components/OtpInput';
import { AuthState } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface Props {
  state: AuthState;
  setState: (patch: Partial<AuthState>) => void;
  onBack: () => void;
  onVerified: () => void;
  loading?: boolean;
  error?: string;
}

export function VerifyScreen({ state, setState, onBack, onVerified, loading, error }: Props) {
  const [secs, setSecs] = React.useState(30);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const code = state.otp || '';
  const full = code.length === 6;
  const dest = state.email || 'your email';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <DotTexture />
      <View style={styles.header}><CircleBack onBack={onBack} /></View>
      <View style={styles.intro}>
        <Text style={styles.h1}>Check your inbox</Text>
        <Text style={styles.sub}>
          We sent a 6-digit code to <Text style={styles.strong}>{dest}</Text>. Enter it below.
        </Text>
      </View>
      <View style={styles.otpBlock}>
        <OtpInput value={code} onChange={v => setState({ otp: v })} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.resend}>
          {secs > 0
            ? <Text style={styles.timer}>Resend code in 0:{String(secs).padStart(2, '0')}</Text>
            : <Pressable onPress={() => setSecs(30)}><Text style={styles.link}>Resend code</Text></Pressable>}
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton onPress={onVerified} disabled={!full} loading={loading}>Verify</PrimaryButton>
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
  otpBlock: { marginTop: 30, gap: 14 },
  error: { fontFamily: fonts.ui, fontSize: 14, color: '#f87171' },
  resend: { alignItems: 'center' },
  timer: { fontFamily: fonts.ui, fontSize: 14, color: colors.fgFaint },
  link: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.jade300, fontWeight: '700' },
});
