import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Crown, Infinity as InfinityIcon, Bot, ChartLine, Users, Bell, ArrowRight, X,
} from 'lucide-react-native';
import Purchases, { PurchasesError, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import * as SecureStore from 'expo-secure-store';
import { useAuthActions } from '@convex-dev/auth/react';
import { PlanOption } from '../components/paywall/PlanOption';
import { RCPlan, mapPackages, SUB_CACHE_KEY } from '../lib/purchases';
import { markManualSignOut } from '../lib/session';
import { useGuestUpgrade } from '../auth/GuestUpgrade';
import { colors, gradients, spacing, shadows } from '../theme/tokens';

// Guideline 3.1.2 requires functional Terms of Use (EULA) and Privacy Policy
// links on the screen where the subscription is offered — not only in Settings.
const TERMS_URL = 'https://stopper.mintlify.io/legal/terms';
const PRIVACY_URL = 'https://stopper.mintlify.io/legal/privacy';

const BENEFITS: [React.ComponentType<any>, string][] = [
  [InfinityIcon, 'Unlimited panic-mode support'],
  [Bot,          'Your 24/7 AI recovery coach'],
  [ChartLine,    'Full progress insights & trends'],
  [Users,        'Private community & circles'],
  [Bell,         'Smart reminders & milestones'],
];

interface Props {
  onPurchase: () => void;
}

const PREVIEW_PLANS: RCPlan[] = [
  { pkg: null as any, id: 'monthly', label: 'Monthly', priceString: '$7.99', subLabel: '$7.99 billed monthly', best: true, badge: 'Best value' },
];

export function PaywallScreen({ onPurchase }: Props) {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthActions();
  const { isGuest } = useGuestUpgrade();
  const [plans, setPlans] = useState<RCPlan[]>(PREVIEW_PLANS);
  const [selId, setSelId] = useState<string | null>(PREVIEW_PLANS[0].id);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    Purchases.getOfferings()
      .then(offerings => {
        const pkgs = offerings.current?.availablePackages ?? [];
        const mapped = mapPackages(pkgs);
        if (mapped.length >= 1) {
          setPlans(mapped);
          const best = mapped.find(p => p.best) ?? mapped[0];
          if (best) setSelId(best.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = plans.find(p => p.id === selId);

  const handlePurchase = async () => {
    if (!selected || purchasing) return;
    if (!selected.pkg) {
      Alert.alert('Pricing unavailable', 'Could not load pricing from the App Store. Please check your connection and try again.');
      return;
    }
    setPurchasing(true);
    try {
      await Purchases.purchasePackage(selected.pkg);
      onPurchase();
    } catch (e) {
      const err = e as PurchasesError;
      if (err.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        Alert.alert('Purchase failed', err.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  // The way back out. A subscription is still required to use Stopper, so this
  // returns to the sign-in screen rather than unlocking anything — it exists so
  // the paywall isn't a dead end the user can only escape by force-quitting.
  const handleExit = () => {
    const leave = async () => {
      await markManualSignOut();
      await SecureStore.deleteItemAsync(SUB_CACHE_KEY).catch(() => {});
      signOut();
    };

    if (isGuest) {
      Alert.alert(
        'Leave without subscribing?',
        "You're using Stopper without an account, so the answers you just gave won't be kept on this device.",
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => { leave(); } },
        ],
      );
      return;
    }

    Alert.alert('Sign out?', 'Your progress is saved to your account and will be here when you come back.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => { leave(); } },
    ]);
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const info = await Purchases.restorePurchases();
      const active = Object.keys(info.entitlements.active).length > 0;
      if (active) {
        onPurchase();
      } else {
        Alert.alert('No active subscription', 'We could not find an active subscription linked to your account.');
      }
    } catch {
      Alert.alert('Restore failed', 'Something went wrong. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={handleExit} accessibilityRole="button" accessibilityLabel="Close" style={styles.closeBtn}>
          <X size={18} color={colors.fgMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screenPad, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.crown}>
            <Crown size={31} color={colors.white} />
          </LinearGradient>
          <Text style={styles.title}>Unlock Stopper Premium</Text>
          <Text style={styles.subtitle}>Everything you need to break the habit for good.</Text>
        </Animated.View>

        <View style={styles.benefits}>
          {BENEFITS.map(([Icon, label]) => (
            <View key={label} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Icon size={16} color={colors.jade300} />
              </View>
              <Text style={styles.benefitTxt}>{label}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.jade500} style={{ marginVertical: 24 }} />
        ) : (
          <View style={{ gap: 13 }}>
            {plans.map(plan => (
              <PlanOption key={plan.id} plan={plan} selected={selId === plan.id} onSelect={setSelId} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable
          onPress={handlePurchase}
          disabled={!selected || purchasing || loading}
          accessibilityRole="button"
          style={[shadows.glowCta, (!selected || purchasing || loading) && { opacity: 0.6 }]}
        >
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            {purchasing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.ctaTxt}>
                  {selected ? `Start ${selected.label} — ${selected.priceString}` : 'Loading…'}
                </Text>
                <ArrowRight size={20} color={colors.white} />
              </>
            )}
          </LinearGradient>
        </Pressable>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Cancel anytime</Text>
          <Text style={styles.meta}>·</Text>
          <Pressable onPress={handleRestore} disabled={restoring}>
            <Text style={[styles.meta, styles.link]}>{restoring ? 'Restoring…' : 'Restore purchase'}</Text>
          </Pressable>
        </View>
        <Text style={styles.fine}>
          {selected
            ? `${selected.label} subscription — ${selected.priceString} per ${selected.label.toLowerCase() === 'weekly' ? 'week' : 'month'}. `
            : ''}
          Payment is charged to your Apple ID at confirmation. It renews automatically unless
          cancelled at least 24 hours before the end of the current period. Manage or cancel in
          App Store Settings.
        </Text>
        <View style={styles.legalRow}>
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={10}>
            <Text style={[styles.fine, styles.link]}>Terms of Use</Text>
          </Pressable>
          <Text style={styles.fine}>·</Text>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={10}>
            <Text style={[styles.fine, styles.link]}>Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: spacing.screenPad, paddingTop: 4, paddingBottom: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  crown: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  title: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 24, color: colors.white, marginTop: 12, textAlign: 'center' },
  subtitle: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14.5, color: colors.fgMuted, marginTop: 7, textAlign: 'center', paddingHorizontal: 18, lineHeight: 20 },
  benefits: { marginVertical: 16, gap: 10 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  benefitIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: 'rgba(20,184,136,0.14)', alignItems: 'center', justifyContent: 'center' },
  benefitTxt: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14.5, color: colors.gray100 },
  footer: { paddingHorizontal: spacing.screenPad, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  cta: { height: 56, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  ctaTxt: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17, color: colors.white },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 10 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 8 },
  meta: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12.5, color: colors.fgFaint },
  link: { color: colors.fgMuted, textDecorationLine: 'underline' },
  fine: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10.5, color: colors.fgFaint, textAlign: 'center', marginTop: 8, lineHeight: 14.5, paddingHorizontal: 8 },
});
