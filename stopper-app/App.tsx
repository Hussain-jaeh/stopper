import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState, AppStateStatus } from 'react-native';
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
import { scheduleMilestoneNotifications } from './src/notifications/reminders';
import { AuthFlow } from './src/auth/AuthFlow';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import { TabNavigator } from './src/navigation/TabNavigator';
import { OnboardingState } from './src/onboarding/state';
import { SplashScreen } from './src/components/splash/SplashScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { colors } from './src/theme/tokens';
import { api } from './convex/_generated/api';

ExpoSplash.preventAutoHideAsync().catch(() => {});
initPurchases();

const SUB_CACHE_KEY = 'rc_has_sub';

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
          </View>
        </NavigationContainer>
      </ConvexAuthProvider>
    </SafeAreaProvider>
  );
}

type Phase = 'loading' | 'auth' | 'onboarding' | 'paywall' | 'app';

function useAppLock() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const profile = useQuery(api.users.getMyProfile);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      const wasBackground = appState.current === 'background' || appState.current === 'inactive';
      appState.current = next;
      if (next === 'active' && wasBackground) {
        const lockEnabled = (profile as any)?.appLockEnabled;
        if (!lockEnabled) return;
        await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock Stopper',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });
      }
    });
    return () => sub.remove();
  }, [profile]);
}

function AppContent({ onBootDone }: { onBootDone: () => void }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getMyProfile);
  useAppLock();
  const saveOnboarding = useMutation(api.users.completeOnboarding);
  const upsertProfile = useMutation(api.profiles.upsertProfile);
  const [phase, setPhase] = useState<Phase>('loading');
  const bootDoneRef = useRef(false);
  const rcCheckedRef = useRef(false);

  const markBoot = useCallback(() => {
    if (!bootDoneRef.current) { bootDoneRef.current = true; onBootDone(); }
  }, [onBootDone]);

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

    // Fast path: cached subscription status lets us skip the RC network call.
    // We still re-verify in the background and update if it changed.
    SecureStore.getItemAsync(SUB_CACHE_KEY).then(cached => {
      if (cached === 'true') {
        setPhase('app');
        markBoot();
        // Re-verify in background; correct phase if subscription has lapsed.
        Purchases.getCustomerInfo()
          .then(info => {
            const hasSub = Object.keys(info.entitlements.active).length > 0;
            SecureStore.setItemAsync(SUB_CACHE_KEY, hasSub ? 'true' : 'false').catch(() => {});
            if (!hasSub) setPhase('paywall');
          })
          .catch(() => {});
        return;
      }

      // No cache or cached false — wait for RC before showing anything.
      Purchases.getCustomerInfo()
        .then(info => {
          const hasSub = Object.keys(info.entitlements.active).length > 0;
          SecureStore.setItemAsync(SUB_CACHE_KEY, hasSub ? 'true' : 'false').catch(() => {});
          setPhase(hasSub ? 'app' : 'paywall');
        })
        .catch(() => setPhase('paywall'))
        .finally(markBoot);
    }).catch(() => {
      // SecureStore failed — fall through to live RC check.
      Purchases.getCustomerInfo()
        .then(info => {
          const hasSub = Object.keys(info.entitlements.active).length > 0;
          setPhase(hasSub ? 'app' : 'paywall');
        })
        .catch(() => setPhase('paywall'))
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

    setPhase(__DEV__ ? 'app' : 'paywall');
  }, [saveOnboarding, upsertProfile]);

  const handlePurchase = useCallback(() => {
    SecureStore.setItemAsync(SUB_CACHE_KEY, 'true').catch(() => {});
    setPhase('app');
  }, []);

  if (phase === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.jade500} size="large" />
      </View>
    );
  }

  if (phase === 'onboarding') {
    return (
      <OnboardingFlow
        startStep={2}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (phase === 'paywall') {
    return (
      <PaywallScreen
        onPurchase={handlePurchase}
      />
    );
  }

  if (phase === 'app') {
    return (
      <TabNavigator
        onStartOnboarding={() => setPhase('onboarding')}
      />
    );
  }

  return <AuthFlow onAuthenticated={handleAuthenticated} />;
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
});
