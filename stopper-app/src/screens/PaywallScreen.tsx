import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  X, Crown, Infinity as InfinityIcon, Bot, ChartLine, Users, Bell, ArrowRight,
} from 'lucide-react-native';
import Purchases, { PurchasesError, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { PlanOption } from '../components/paywall/PlanOption';
import { RCPlan, mapPackages } from '../lib/purchases';
import { colors, gradients, spacing, shadows } from '../theme/tokens';

const BENEFITS: [React.ComponentType<any>, string][] = [
  [InfinityIcon, 'Unlimited panic-mode support'],
  [Bot,          'Your 24/7 AI recovery coach'],
  [ChartLine,    'Full progress insights & trends'],
  [Users,        'Private community & circles'],
  [Bell,         'Smart reminders & milestones'],
];

interface Props {
  onClose: () => void;
  onPurchase: () => void;
}

const PREVIEW_PLANS: RCPlan[] = [
  { pkg: null as any, id: 'weekly',  label: 'Weekly',  priceString: '$4.99', subLabel: '$4.99 billed weekly',  best: false },
  { pkg: null as any, id: 'monthly', label: 'Monthly', priceString: '$7.99', subLabel: '$7.99 billed monthly', best: true, badge: 'Best value' },
];

export function PaywallScreen({ onClose, onPurchase }: Props) {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<RCPlan[]>(PREVIEW_PLANS);
  const [selId, setSelId] = useState<string | null>('monthly');
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    Purchases.getOfferings()
      .then(offerings => {
        const pkgs = offerings.current?.availablePackages ?? [];
        const mapped = mapPackages(pkgs);
        // Only use RC data when both weekly and monthly are configured
        if (mapped.length >= 2) {
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
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screenPad, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.closeRow}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.close}>
            <X size={18} color={colors.fgMuted} />
          </Pressable>
        </View>

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
          Renews automatically until cancelled. Manage in App Store Settings. Terms apply.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  closeRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 4 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  crown: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  title: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 27, color: colors.white, marginTop: 18, textAlign: 'center' },
  subtitle: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15.5, color: colors.fgMuted, marginTop: 10, textAlign: 'center', paddingHorizontal: 18, lineHeight: 21 },
  benefits: { marginVertical: 26, gap: 13 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  benefitIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(20,184,136,0.14)', alignItems: 'center', justifyContent: 'center' },
  benefitTxt: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, color: colors.gray100 },
  footer: { paddingHorizontal: spacing.screenPad, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  cta: { height: 56, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  ctaTxt: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17, color: colors.white },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 12 },
  meta: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12.5, color: colors.fgFaint },
  link: { color: colors.fgMuted, textDecorationLine: 'underline' },
  fine: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: colors.fgFaint, textAlign: 'center', marginTop: 10, lineHeight: 15, paddingHorizontal: 8 },
});
