import React, { useState, useEffect, useCallback, useRef, Component, type ReactNode } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ExpoSplash from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { ConvexAuthProvider, useConvexAuth } from '@convex-dev/auth/react';
import { ConvexReactClient, useQuery, useMutation } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Purchases from 'react-native-purchases';
import { initPurchases } from './src/lib/purchases';
import { scheduleMilestoneNotifications, scheduleReminder } from './src/notifications/reminders';
import { AuthFlow } from './src/auth/AuthFlow';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import { TabNavigator } from './src/navigation/TabNavigator';
import { OnboardingState } from './src/onboarding/state';
import { SplashScreen } from './src/components/splash/SplashScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { colors } from './src/theme/tokens';
import { api } from './convex/_generated/api';

ExpoSplash.preventAutoHideAsync().catch(() => {});
try { initPurchases(); } catch {}


const SUB_CACHE_KEY = 'rc_has_sub';

function rcGetCustomerInfo() {
  return Promise.race([
    Purchases.getCustomerInfo(),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('rc_timeout')), 12000)),
  ]);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

class AppErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean; errorMsg: string }> {
  state = { crashed: false, errorMsg: '' };
  static getDerivedStateFromError(e: Error) { return { crashed: true, errorMsg: e?.message ?? String(e) }; }
  componentDidCatch(e: Error) { console.error('[AppErrorBoundary]', e?.message, e?.stack); }
  render() {
    if (this.state.crashed) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 }}>
          <Text style={{ color: colors.fgMuted, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, textAlign: 'center' }}>
            Something went wrong. Please restart the app.
          </Text>
          <Text style={{ color: '#f87171', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, textAlign: 'center' }}>
            {this.state.errorMsg}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque: BricolageGrotesque_800ExtraBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    PlusJakartaSans: PlusJakartaSans_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [bootDone, setBootDone] = useState(false);
  const [minDone, setMinDone] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) ExpoSplash.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  useEffect(() => {
    if (bootDone && minDone) setShowSplash(false);
  }, [bootDone, minDone]);

  // Hard cap so splash never gets permanently stuck.
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // ConvexAuthProvider + NavigationContainer wrap everything so auth and
  // profile queries start the moment fonts are ready, running in parallel
  // with the splash animation rather than after it.
  return (
    <SafeAreaProvider>
      <ConvexAuthProvider client={convex} storage={secureStorage}>
        <NavigationContainer>
          <View style={styles.root}>
            <StatusBar style="light" />
            <AppErrorBoundary>
              {fontsLoaded && (
                <AppContent onBootDone={() => setBootDone(true)} />
              )}
              {(!fontsLoaded || showSplash) && (
                <View style={StyleSheet.absoluteFill}>
                  <SplashScreen
                    minDurationMs={800}
                    onFinish={() => setMinDone(true)}
                  />
                </View>
              )}
            </AppErrorBoundary>
          </View>
        </NavigationContainer>
      </ConvexAuthProvider>
    </SafeAreaProvider>
  );
}

type Phase = 'loading' | 'auth' | 'onboarding' | 'paywall' | 'app';

function useAppLock() {
  const [locked, setLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const profile = useQuery(api.users.getMyProfile);

  const authenticate = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Stopper',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      if (result.success) setLocked(false);
    } catch {}
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const wasBackground = appState.current === 'background' || appState.current === 'inactive';
      appState.current = next;
      if (next === 'active' && wasBackground && (profile as any)?.appLockEnabled) {
        setLocked(true);
      }
    });
    return () => sub.remove();
  }, [profile]);

  useEffect(() => {
    if (locked) authenticate();
  }, [locked, authenticate]);

  return { locked, authenticate };
}

function AppContent({ onBootDone }: { onBootDone: () => void }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getMyProfile);
  const recoveryProfile = useQuery(api.profiles.getProfile);
  const { locked, authenticate } = useAppLock();
  const saveOnboarding = useMutation(api.users.completeOnboarding);
  const upsertProfile = useMutation(api.profiles.upsertProfile);
  const [phase, setPhase] = useState<Phase>('loading');
  const bootDoneRef = useRef(false);
  const rcCheckedRef = useRef(false);
  const notifScheduledRef = useRef(false);

  const markBoot = useCallback(() => {
    if (!bootDoneRef.current) { bootDoneRef.current = true; onBootDone(); }
  }, [onBootDone]);

  // Re-schedule notifications once per session when the user is in the app.
  // Handles fresh installs, reinstalls, and returning users whose scheduled
  // local notifications were wiped. Runs in 'app' AND 'paywall' so that users
  // who reinstall and land on the paywall still get their notifications back.
  useEffect(() => {
    if (phase === 'loading' || phase === 'auth' || phase === 'onboarding') return;
    if (notifScheduledRef.current || !recoveryProfile) return;
    notifScheduledRef.current = true;
    scheduleMilestoneNotifications(recoveryProfile.quitDate).catch(e => console.warn('[notifications] milestone scheduling failed', e));
    scheduleReminder().catch(e => console.warn('[notifications] reminder scheduling failed', e));
  }, [phase, recoveryProfile, profile?.remindersOn]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setPhase('auth');
      markBoot();
      return;
    }
    if (profile === undefined) return;

    if (!profile?.onboardingComplete) {
      setPhase(prev => prev === 'loading' ? 'onboarding' : prev);
      markBoot();
      return;
    }

    if (rcCheckedRef.current) {
      markBoot();
      return;
    }
    rcCheckedRef.current = true;

    // Skip paywall entirely in local dev / simulator.
    if (__DEV__) {
      setPhase('app');
      markBoot();
      return;
    }

    // Fast path: cached 'true' lets us skip the RC network call entirely.
    // We re-verify in the background and only correct to paywall if RC
    // definitively confirms the subscription has lapsed.
    // On any RC error we default to 'app' — it's better to briefly let a
    // subscriber in than to wrongly block them on a network blip or RC
    // initialization race.
    SecureStore.getItemAsync(SUB_CACHE_KEY).then(cached => {
      if (cached === 'true') {
        setPhase('app');
        markBoot();
        // Re-verify in background; correct only if sub has definitively lapsed.
        rcGetCustomerInfo()
          .then(info => {
            const hasSub = Object.keys(info.entitlements.active).length > 0;
            SecureStore.setItemAsync(SUB_CACHE_KEY, hasSub ? 'true' : 'false').catch(() => {});
            if (!hasSub) setPhase('paywall');
          })
          .catch(() => {}); // RC error: keep showing app, don't disrupt user
        return;
      }

      // No cache or cached false — wait for RC before showing anything.
      rcGetCustomerInfo()
        .then(info => {
          const hasSub = Object.keys(info.entitlements.active).length > 0;
          SecureStore.setItemAsync(SUB_CACHE_KEY, hasSub ? 'true' : 'false').catch(() => {});
          setPhase(hasSub ? 'app' : 'paywall');
        })
        .catch(() => {
          // RC unavailable / not yet initialized — default to app so subscribers
          // aren't wrongly blocked. Will re-check on next cold start.
          setPhase('app');
        })
        .finally(markBoot);
    }).catch(() => {
      // SecureStore failed — fall through to live RC check.
      rcGetCustomerInfo()
        .then(info => {
          const hasSub = Object.keys(info.entitlements.active).length > 0;
          setPhase(hasSub ? 'app' : 'paywall');
        })
        .catch(() => setPhase('app')) // RC error: let them in, re-check next time
        .finally(markBoot);
    });
  }, [isLoading, isAuthenticated, profile]);

  const handleAuthenticated = useCallback(() => {
    if (profile === undefined) { setPhase('loading'); return; }
    setPhase(profile?.onboardingComplete ? 'loading' : 'onboarding');
  }, [profile]);

  const handleOnboardingComplete = useCallback(async (state: OnboardingState) => {
    setPhase('loading');
    rcCheckedRef.current = true;

    const addictionType = [...state.overcome][0] ?? 'other';
    const reasonForQuitting = [...state.reasons][0] ?? 'personal growth';
    const quitDate = Date.now();

    // Save everything in one round-trip so spending is never lost.
    await Promise.all([
      saveOnboarding({
        habitType: addictionType,
        displayName: state.name || undefined,
        age: state.age || undefined,
        remindersOn: true,
      }),
      upsertProfile({
        addictionType,
        quitDate,
        reasonForQuitting,
        ...(state.spendingAmount ? {
          spendingAmount: state.spendingAmount,
          spendingFrequency: (state.spendingFrequency || 'monthly') as 'daily' | 'weekly' | 'monthly',
          currency: state.spendingCurrency || 'USD',
          trackingEnabled: true,
        } : {}),
      }),
    ]);

    scheduleMilestoneNotifications(quitDate).catch(() => {});
    scheduleReminder().catch(() => {});

    setPhase(__DEV__ ? 'app' : 'paywall');
  }, [saveOnboarding, upsertProfile]);

  const handlePurchase = useCallback(() => {
    SecureStore.setItemAsync(SUB_CACHE_KEY, 'true').catch(() => {});
    setPhase('app');
  }, []);

  let content: React.ReactNode;
  if (phase === 'loading') {
    content = (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.jade500} size="large" />
      </View>
    );
  } else if (phase === 'onboarding') {
    content = <OnboardingFlow startStep={2} onComplete={handleOnboardingComplete} />;
  } else if (phase === 'paywall') {
    content = <PaywallScreen onPurchase={handlePurchase} />;
  } else if (phase === 'app') {
    content = <TabNavigator onStartOnboarding={() => setPhase('onboarding')} />;
  } else {
    content = <AuthFlow onAuthenticated={handleAuthenticated} />;
  }

  return (
    <>
      {content}
      {locked && (
        <Pressable onPress={authenticate} style={styles.lockScreen}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Stopper is locked</Text>
          <Text style={styles.lockSub}>Tap to authenticate</Text>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockScreen: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 999,
  },
  lockIcon: { fontSize: 44 },
  lockTitle: { color: colors.fg, fontSize: 20, fontWeight: '700' },
  lockSub: { color: colors.fgMuted, fontSize: 14 },
});
