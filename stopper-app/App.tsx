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
import { ConvexAuthProvider, useConvexAuth, useAuthActions } from '@convex-dev/auth/react';
import { ConvexReactClient, useQuery, useMutation } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Purchases from 'react-native-purchases';
import { initPurchases, SUB_CACHE_KEY } from './src/lib/purchases';
import { clearAuthIntent, isFirstEverLaunch } from './src/lib/session';
import { scheduleMilestoneNotifications, scheduleReminder } from './src/notifications/reminders';
import { AuthFlow } from './src/auth/AuthFlow';
import { GuestUpgradeProvider } from './src/auth/GuestUpgrade';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import { TabNavigator } from './src/navigation/TabNavigator';
import { OnboardingState } from './src/onboarding/state';
import { AuthState } from './src/auth/state';
import { SplashScreen } from './src/components/splash/SplashScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { colors } from './src/theme/tokens';
import { api } from './convex/_generated/api';

ExpoSplash.preventAutoHideAsync().catch(() => {});
try { initPurchases(); } catch {}


/**
 * Debug builds skip the paywall so the simulator doesn't need StoreKit. That
 * also makes the guest → paywall → app flow impossible to test locally, so it
 * can be switched back on: set EXPO_PUBLIC_SKIP_PAYWALL=false in .env.local and
 * restart Metro with `npx expo start -c`. Release builds always enforce it.
 */
const SKIP_PAYWALL = __DEV__ && process.env.EXPO_PUBLIC_SKIP_PAYWALL !== 'false';

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

/*
 * Anything that throws at module scope dies before React mounts, so the error
 * boundary never sees it and the app simply freezes on the native launch
 * screen with no message. Capture the failure instead and render it.
 */
let convex: ConvexReactClient | null = null;
let bootError: string | null = null;
try {
  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      'EXPO_PUBLIC_CONVEX_URL is not set. Metro did not pick up .env.local — ' +
      'restart it with: npx expo start -c',
    );
  }
  convex = new ConvexReactClient(convexUrl, { unsavedChangesWarning: false });
} catch (e) {
  bootError = e instanceof Error ? e.message : String(e);
  console.error('[boot] Startup failed before React mounted.', e);
}

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

  // Safety net: the native splash is hidden only once fonts resolve, so a font
  // that never loads leaves the app frozen on the launch screen with no way
  // out. Hide it regardless after a few seconds — a wrong typeface is a far
  // better failure than an app that appears not to start.
  useEffect(() => {
    const t = setTimeout(() => { ExpoSplash.hideAsync().catch(() => {}); }, 3000);
    return () => clearTimeout(t);
  }, []);

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
  if (bootError || !convex) {
    ExpoSplash.hideAsync().catch(() => {});
    return (
      <SafeAreaProvider>
        <View style={styles.bootError}>
          <Text style={styles.bootErrorTitle}>Stopper could not start</Text>
          <Text style={styles.bootErrorBody}>{bootError ?? 'Unknown startup error.'}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

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

type Phase = 'loading' | 'auth' | 'onboarding' | 'paywall' | 'upgrade' | 'app';

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
  const { signIn } = useAuthActions();
  const profile = useQuery(api.users.getMyProfile);
  const recoveryProfile = useQuery(api.profiles.getProfile);
  const { locked, authenticate } = useAppLock();
  const saveOnboarding = useMutation(api.users.completeOnboarding);
  const upsertProfile = useMutation(api.profiles.upsertProfile);
  const issueMigrationTicket = useMutation(api.guest.issueMigrationTicket);
  const redeemMigrationTicket = useMutation(api.guest.redeemMigrationTicket);
  const migrationTicket = useRef<string | null>(null);
  const upgradingRef = useRef(false);
  const guestBootstrapRef = useRef(false);
  const [phase, setPhase] = useState<Phase>('loading');
  const bootDoneRef = useRef(false);
  const rcCheckedRef = useRef(false);
  const notifScheduledRef = useRef(false);
  const appleDisplayName = useRef<string | undefined>(undefined);

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

  const bootstrapGuestSession = useCallback(async () => {
    if (!(await isFirstEverLaunch())) {
      console.log('[auth] Existing install — showing the auth screen rather than creating a guest.');
      setPhase('auth');
      markBoot();
      return;
    }
    try {
      console.log('[auth] First launch — creating an anonymous session.');
      await signIn('anonymous');
      // isAuthenticated flips, the routing effect re-runs, and the user lands
      // in onboarding with no profile yet.
    } catch (e) {
      // No connection, or the deployment has no anonymous provider. Fall back
      // to the auth screen rather than leaving the user on a spinner; its
      // guest button retries this same call.
      console.warn('[auth] Anonymous sign-in failed, falling back to the auth screen.', e);
      setPhase('auth');
      markBoot();
    }
  }, [signIn, markBoot]);

  useEffect(() => {
    if (isLoading) return;
    // A guest registering swaps one session for another; don't bounce them back
    // to the landing screen mid-flow.
    if (upgradingRef.current) return;
    if (!isAuthenticated) {
      // Nobody is asked to register to start using Stopper. A brand-new
      // install gets an anonymous account and goes straight to onboarding;
      // registration stays available, and stays optional, from Profile.
      // Anyone who signed out deliberately, or whose bootstrap failed, still
      // gets the auth screen.
      if (guestBootstrapRef.current) {
        setPhase('auth');
        markBoot();
        return;
      }
      guestBootstrapRef.current = true;
      void bootstrapGuestSession();
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

    if (SKIP_PAYWALL) {
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
        // Re-verify in background — only update the cache, never interrupt an active session.
        // Paywall enforcement happens on the next cold start if the subscription has lapsed.
        rcGetCustomerInfo()
          .then(info => {
            const hasSub = Object.keys(info.entitlements.active).length > 0;
            SecureStore.setItemAsync(SUB_CACHE_KEY, hasSub ? 'true' : 'false').catch(() => {});
          })
          .catch(() => {});
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
          // RC unavailable, or the 12s timeout fired. We only reach here when the
          // cache is absent or 'false', so this user has never been confirmed as a
          // subscriber — show the paywall rather than granting access. A real
          // subscriber whose check failed still has Restore Purchase there.
          // Granting instead made the paywall trivially bypassable offline.
          setPhase('paywall');
        })
        .finally(markBoot);
    }).catch(() => {
      // SecureStore failed — fall through to live RC check.
      rcGetCustomerInfo()
        .then(info => {
          const hasSub = Object.keys(info.entitlements.active).length > 0;
          setPhase(hasSub ? 'app' : 'paywall');
        })
        .catch(() => setPhase('paywall')) // Unverified: paywall, with Restore available
        .finally(markBoot);
    });
  }, [isLoading, isAuthenticated, profile, bootstrapGuestSession]);

  const handleAuthenticated = useCallback((authState?: AuthState) => {
    void clearAuthIntent();
    if (authState?.displayName) appleDisplayName.current = authState.displayName;
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

    if (SKIP_PAYWALL) { setPhase('app'); return; }

    // A subscription bought as a guest carries over to the account they create.
    const cached = await SecureStore.getItemAsync(SUB_CACHE_KEY).catch(() => null);
    if (cached === 'true') { setPhase('app'); return; }

    setPhase('paywall');
  }, [saveOnboarding, upsertProfile]);

  const handlePurchase = useCallback(() => {
    SecureStore.setItemAsync(SUB_CACHE_KEY, 'true').catch(() => {});
    setPhase('app');
  }, []);

  // A guest chose to register. Mint the handoff ticket while still signed in as
  // the guest, then show the sign-up screens with guest mode hidden.
  const handleStartUpgrade = useCallback(async () => {
    upgradingRef.current = true;
    try {
      migrationTicket.current = await issueMigrationTicket();
    } catch {
      migrationTicket.current = null;
    }
    setPhase('upgrade');
  }, [issueMigrationTicket]);

  // Backing out of the upgrade. Without this the guest is stranded on the auth
  // screen: it has no navigation of its own, and upgradingRef short-circuits
  // the routing effect, so force-quitting was the only way back.
  const handleCancelUpgrade = useCallback(() => {
    migrationTicket.current = null;
    upgradingRef.current = false;
    setPhase('app');
  }, []);

  // Registration finished — move the guest's data onto the new account.
  const handleUpgraded = useCallback(async () => {
    const token = migrationTicket.current;
    migrationTicket.current = null;
    if (token) {
      try { await redeemMigrationTicket({ token }); } catch {}
    }
    upgradingRef.current = false;
    setPhase('app');
  }, [redeemMigrationTicket]);

  let content: React.ReactNode;
  if (phase === 'loading') {
    content = (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.jade500} size="large" />
      </View>
    );
  } else if (phase === 'onboarding') {
    content = <OnboardingFlow startStep={2} onComplete={handleOnboardingComplete} initialName={appleDisplayName.current} />;
  } else if (phase === 'paywall') {
    content = <PaywallScreen onPurchase={handlePurchase} />;
  } else if (phase === 'upgrade') {
    content = <AuthFlow allowGuest={false} onAuthenticated={handleUpgraded} onCancel={handleCancelUpgrade} />;
  } else if (phase === 'app') {
    content = <TabNavigator onStartOnboarding={() => setPhase('onboarding')} />;
  } else {
    content = <AuthFlow onAuthenticated={handleAuthenticated} />;
  }

  return (
    <GuestUpgradeProvider onStartUpgrade={handleStartUpgrade}>
      {content}
      {locked && (
        <Pressable onPress={authenticate} style={styles.lockScreen}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Stopper is locked</Text>
          <Text style={styles.lockSub}>Tap to authenticate</Text>
        </Pressable>
      )}
    </GuestUpgradeProvider>
  );
}

const styles = StyleSheet.create({
  bootError: {
    flex: 1, backgroundColor: colors.bg, alignItems: 'center',
    justifyContent: 'center', padding: 32, gap: 12,
  },
  bootErrorTitle: { color: colors.white, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  bootErrorBody: { color: '#f87171', fontSize: 13, textAlign: 'center', lineHeight: 19 },
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
