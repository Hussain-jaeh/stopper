
import { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { useAuthActions } from '@convex-dev/auth/react';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import { colors } from '../theme/tokens';
import { AuthState, freshAuthState } from './state';
import { AuthLandingScreen } from './screens/AuthLandingScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { VerifyScreen } from './screens/VerifyScreen';
import { SignInScreen } from './screens/SignInScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { AuthSuccessScreen } from './screens/AuthSuccessScreen';

type AuthRoute = 'landing' | 'signup' | 'verify' | 'signin' | 'forgot' | 'success';

interface AuthFlowProps {
  initialRoute?: AuthRoute;
  onAuthenticated?: (state: AuthState) => void;
}

export function AuthFlow({ initialRoute = 'landing', onAuthenticated }: AuthFlowProps) {
  const { signIn } = useAuthActions();
  const [route, setRoute] = useState<AuthRoute>(initialRoute);
  const [state, setStateRaw] = useState<AuthState>(freshAuthState);
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | undefined>();
  const [signUpError, setSignUpError] = useState<string | undefined>();
  const [verifyError, setVerifyError] = useState<string | undefined>();
  const [resetError, setResetError] = useState<string | undefined>();

  const setState = useCallback((patch: Partial<AuthState>) => {
    setStateRaw(prev => ({ ...prev, ...patch }));
  }, []);

  const go = (r: AuthRoute) => setRoute(r);
  const finish = () => onAuthenticated?.(state);

  const withLoading = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  const friendlyError = (msg: string, context: 'signIn' | 'signUp' | 'verify' | 'reset') => {
    if (msg.includes('InvalidAccountId')) return 'No account found with that email. Try signing up.';
    if (msg.includes('InvalidSecret')) return 'Incorrect password. Please try again.';
    if (msg.includes('TooManyFailedAttempts')) return 'Too many failed attempts. Please wait a moment.';
    if (msg.includes('AccountAlreadyExists') || msg.includes('already')) return 'An account with this email already exists. Try signing in.';
    if (context === 'verify') return 'Invalid or expired code. Please try again.';
    if (context === 'reset') return 'Could not send reset link. Check your email address.';
    if (context === 'signUp') return 'Sign up failed. Please try again.';
    return 'Something went wrong. Please try again.';
  };

  const handleSignUp = () => withLoading(async () => {
    setSignUpError(undefined);
    try {
      await signIn('password', { flow: 'signUp', email: state.email, password: state.password });
      go('success');
    } catch (e: any) {
      setSignUpError(friendlyError(e?.message ?? '', 'signUp'));
    }
  });

  const handleVerify = () => withLoading(async () => {
    setVerifyError(undefined);
    try {
      await signIn('password', { flow: 'email-verification', email: state.email, code: state.otp });
      go('success');
    } catch (e: any) {
      setVerifyError(friendlyError(e?.message ?? '', 'verify'));
    }
  });

  const handleSignIn = () => withLoading(async () => {
    setSignInError(undefined);
    try {
      await signIn('password', { flow: 'signIn', email: state.email, password: state.password });
      go('success');
    } catch (e: any) {
      setSignInError(friendlyError(e?.message ?? '', 'signIn'));
    }
  });

  const handleGoogle = () => withLoading(async () => {
    const callbackUrl = Linking.createURL('/');
    try {
      const result = await signIn('google', { redirectTo: callbackUrl });
      if (!result.redirect) return;
      const browserResult = await WebBrowser.openAuthSessionAsync(
        result.redirect.toString(),
        callbackUrl,
      );
      if (browserResult.type === 'success') {
        const parsed = Linking.parse(browserResult.url);
        const code = parsed.queryParams?.code as string | undefined;
        if (code) {
          await (signIn as Function)(undefined, { code });
          go('success');
        }
      }
    } catch (e: any) {
      Alert.alert('Google sign in failed', e?.message ?? 'Please try again.');
    }
  });

  const handleApple = () => withLoading(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('No identity token from Apple');
      await signIn('apple', { identityToken: credential.identityToken });
      go('success');
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Apple sign in failed', e?.message ?? 'Please try again.');
    }
  });

  const handleReset = async () => {
    setResetError(undefined);
    await withLoading(async () => {
      try {
        await signIn('password', { flow: 'reset', email: state.email });
      } catch (e: any) {
        setResetError(friendlyError(e?.message ?? '', 'reset'));
        throw e;
      }
    });
  };

  switch (route) {
    case 'landing':
      return (
        <View style={styles.fill}>
          <AuthLandingScreen
            onApple={Platform.OS === 'ios' ? handleApple : undefined}
            onGoogle={handleGoogle}
            onEmail={() => go('signup')}
            onSignIn={() => go('signin')}
            loading={loading}
          />
        </View>
      );
    case 'signup':
      return (
        <View style={styles.fill}>
          <SignUpScreen
            state={state} setState={setState}
            onBack={() => { setSignUpError(undefined); go('landing'); }}
            onNext={() => handleSignUp()}
            onSignIn={() => { setSignUpError(undefined); go('signin'); }}
            error={signUpError}
            loading={loading}
          />
        </View>
      );
    case 'verify':
      return (
        <View style={styles.fill}>
          <VerifyScreen
            state={state} setState={setState}
            onBack={() => { setVerifyError(undefined); go('signup'); }}
            onVerified={() => handleVerify()}
            error={verifyError}
            loading={loading}
          />
        </View>
      );
    case 'signin':
      return (
        <View style={styles.fill}>
          <SignInScreen
            state={state} setState={setState}
            onBack={() => { setSignInError(undefined); go('landing'); }}
            onSignedIn={() => handleSignIn()}
            onForgot={() => { setSignInError(undefined); go('forgot'); }}
            onApple={Platform.OS === 'ios' ? handleApple : undefined}
            onGoogle={handleGoogle}
            loading={loading}
          />
        </View>
      );
    case 'forgot':
      return (
        <View style={styles.fill}>
          <ForgotPasswordScreen
            state={state} setState={setState}
            onBack={() => { setResetError(undefined); go('signin'); }}
            onDone={() => go('signin')}
            onSendReset={handleReset}
            error={resetError}
            loading={loading}
          />
        </View>
      );
    case 'success':
      return (
        <View style={styles.fill}>
          <AuthSuccessScreen onEnter={finish} />
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
});
