import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  X, Crown, Infinity as InfinityIcon, Bot, ChartLine, Users, Bell, ArrowRight,
} from 'lucide-react-native';
import { PlanOption, Plan, naira } from '../components/paywall/PlanOption';
import { colors, gradients, spacing, shadows } from '../theme/tokens';

const PLANS: Plan[] = [
  { id: 'weekly',  label: 'Weekly',  price: 5000,  per: 'week',  sub: '₦5,000 billed weekly' },
  { id: 'yearly',  label: 'Yearly',  price: 56000, per: 'year',  sub: '₦56,000 billed yearly', best: true, perMonth: 4667, badge: 'Best value · Save 78%' },
  { id: 'monthly', label: 'Monthly', price: 7800,  per: 'month', sub: '₦7,800 billed monthly' },
];
const ORDER: Plan['id'][] = ['weekly', 'yearly', 'monthly'];

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

export function PaywallScreen({ onClose, onPurchase }: Props) {
  const insets = useSafeAreaInsets();
  const [sel, setSel] = useState<Plan['id']>('yearly');
  const plan = PLANS.find(p => p.id === sel)!;

  // TODO: wire RevenueCat — onPurchase → Purchases.purchasePackage(pkgFor(sel))
  // TODO: onRestore → Purchases.restorePurchases()
  const onRestore = () => {};

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

        <View style={{ gap: 13 }}>
          {ORDER.map(id => {
            const p = PLANS.find(x => x.id === id)!;
            return <PlanOption key={id} plan={p} selected={sel === id} onSelect={setSel} />;
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable onPress={onPurchase} accessibilityRole="button" style={shadows.glowCta}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            <Text style={styles.ctaTxt}>Start {plan.label} — {naira(plan.price)}</Text>
            <ArrowRight size={20} color={colors.white} />
          </LinearGradient>
        </Pressable>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Cancel anytime</Text>
          <Text style={styles.meta}>·</Text>
          <Pressable onPress={onRestore}>
            <Text style={[styles.meta, styles.link]}>Restore purchase</Text>
          </Pressable>
        </View>
        <Text style={styles.fine}>
          Billed in Nigerian Naira. Renews automatically until cancelled. Terms apply.
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
