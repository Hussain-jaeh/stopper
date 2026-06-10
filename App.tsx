import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
import { AuthFlow } from './src/auth/AuthFlow';
import { HomeScreen } from './src/app/HomeScreen';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import { OnboardingState } from './src/onboarding/state';
import { colors } from './src/theme/tokens';
import { api } from '../convex/_generated/api';

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

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.jade500} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ConvexAuthProvider client={convex} storage={secureStorage}>
        <View style={styles.root}>
          <StatusBar style="light" />
          <AppContent />
        </View>
      </ConvexAuthProvider>
    </SafeAreaProvider>
  );
}

type Phase = 'loading' | 'auth' | 'onboarding' | 'app';

function AppContent() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getMyProfile);
  const saveOnboarding = useMutation(api.users.completeOnboarding);
  const [phase, setPhase] = useState<Phase>('loading');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { setPhase('auth'); return; }
    if (profile === undefined) return; // query still in flight
    setPhase(prev => {
      if (prev === 'loading') return profile?.onboardingComplete ? 'app' : 'onboarding';
      if (prev === 'app' && !isAuthenticated) return 'auth';
      return prev;
    });
  }, [isLoading, isAuthenticated, profile]);

  // Called when user taps "Enter Stopper" on the auth success screen.
  // Route based on profile — if still loading, briefly show loader then the
  // effect above will settle it once the query resolves.
  const handleAuthenticated = useCallback(() => {
    if (profile === undefined) { setPhase('loading'); return; }
    setPhase(profile?.onboardingComplete ? 'app' : 'onboarding');
  }, [profile]);

  const handleOnboardingComplete = useCallback(async (state: OnboardingState) => {
    await saveOnboarding({
      habitType: [...state.overcome][0] ?? undefined,
      displayName: state.name || undefined,
      age: state.age || undefined,
    });
    setPhase('app');
  }, [saveOnboarding]);

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
        onSkip={() => setPhase('app')}
      />
    );
  }

  if (phase === 'app') {
    return <HomeScreen />;
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
