import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ExpoSplash from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_600SemiBold,
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

// Show alerts and play sound when a notification arrives while the app is foregrounded.
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
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
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

  // Hide native splash the moment fonts are ready; animated splash takes over.
  useEffect(() => {
    if (fontsLoaded) ExpoSplash.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // Dismiss animated splash once BOTH the min duration and boot work are done.
  // Hard cap of 4 s so the splash never gets stuck if Convex auth stalls.
  useEffect(() => {
    if (bootDone && minDone) setShowSplash(false);
  }, [bootDone, minDone]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!fontsLoaded || showSplash) {
    return (
      <SplashScreen
        minDurationMs={1600}
        onFinish={() => setMinDone(true)}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <ConvexAuthProvider client={convex} storage={secureStorage}>
        <NavigationContainer>
          <View style={styles.root}>
            <StatusBar style="light" />
            <AppContent onBootDone={() => setBootDone(true)} />
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
        // Re-query app lock setting from Convex isn't available here, so we
        // rely on SecureStore or the profile query result cached in memory.
        // The profile query above keeps it fresh while the app is running.
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

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setPhase('auth');
      if (!bootDoneRef.current) { bootDoneRef.current = true; onBootDone(); }
      return;
    }
    if (profile === undefined) return;

    if (!profile?.onboardingComplete) {
      setPhase(prev => prev === 'loading' ? 'onboarding' : prev);
      if (!bootDoneRef.current) { bootDoneRef.current = true; onBootDone(); }
      return;
    }

    // Onboarding complete — check subscription once per session
    if (rcCheckedRef.current) {
      if (!bootDoneRef.current) { bootDoneRef.current = true; onBootDone(); }
      return;
    }
    rcCheckedRef.current = true;

    Purchases.getCustomerInfo()
      .then(info => {
        const hasSub = Object.keys(info.entitlements.active).length > 0;
        setPhase(hasSub ? 'app' : 'paywall');
      })
      .catch(() => setPhase('paywall'))
      .finally(() => {
        if (!bootDoneRef.current) { bootDoneRef.current = true; onBootDone(); }
      });
  }, [isLoading, isAuthenticated, profile]);

  // Called when user taps "Enter Stopper" on the auth success screen.
  // Route based on profile — if still loading, briefly show loader then the
  // effect above will settle it once the query resolves.
  const handleAuthenticated = useCallback(() => {
    if (profile === undefined) { setPhase('loading'); return; }
    setPhase(profile?.onboardingComplete ? 'loading' : 'onboarding');
  }, [profile]);

  const handleOnboardingComplete = useCallback(async (state: OnboardingState) => {
    const addictionType = [...state.overcome][0] ?? 'other';
    const reasonForQuitting = [...state.reasons][0] ?? 'personal growth';
    const quitDate = Date.now();
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
      }),
    ]);
    scheduleMilestoneNotifications(quitDate).catch(() => {});
    setPhase('paywall');
  }, [saveOnboarding, upsertProfile]);

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
        onPurchase={() => setPhase('app')}
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
