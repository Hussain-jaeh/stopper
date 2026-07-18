import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, Lock, PiggyBank, ChevronLeft } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { type } from '../../constants/typography';
import {
  SpendingSettings, SpendingFrequency, CURRENCIES,
  savedTotal, projection, perDay, fmtMoney, buildMoneyMilestones,
} from '../../lib/money';

export function MoneyInsights({
  settings, daysSinceQuit, onBack,
}: { settings: SpendingSettings; daysSinceQuit: number; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const total = savedTotal(settings, daysSinceQuit);
  const p = projection(settings);
  const pd = perDay(settings.spendingAmount, settings.spendingFrequency);
  const proj: [string, number][] = [['In 30 days', p.in30], ['In 6 months', p.in6mo], ['In 1 year', p.in1yr]];
  const milestones = buildMoneyMilestones(settings.currency);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.screenPad, paddingTop: insets.top + 16, paddingBottom: 96 }}>
      <View style={styles.navRow}>
        <Pressable onPress={onBack} style={styles.backBtn}><ChevronLeft size={20} color={colors.white} /></Pressable>
        <Text style={styles.navTitle}>Money saved</Text>
      </View>

      <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
        <Text style={styles.heroEyebrow}>KEPT SO FAR</Text>
        <Text style={styles.heroBig}>{fmtMoney(total, settings.currency)}</Text>
        <Text style={styles.heroSub}>across {daysSinceQuit} days free</Text>
      </Animated.View>

      <Text style={styles.section}>IF YOU KEEP YOUR STREAK</Text>
      {proj.map(([label, val]) => (
        <View key={label} style={styles.projRow}>
          <Text style={styles.projLbl}>{label}</Text>
          <Text style={styles.projVal}>{fmtMoney(val, settings.currency)}</Text>
        </View>
      ))}

      <Text style={styles.section}>SAVINGS MILESTONES</Text>
      {milestones.map((m, i) => {
        const reached = total >= m.threshold;
        const day = Math.ceil(m.threshold / pd);
        return (
          <View key={i} style={[styles.mileRow, { opacity: reached ? 1 : 0.62 }]}>
            <View style={[styles.mileIcon, { backgroundColor: reached ? colors.jade500 : colors.surface2 }]}>
              {reached ? <Check size={20} color={colors.onAccent} /> : <Lock size={16} color={colors.textFaint} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mileTitle}>First {fmtMoney(m.threshold, settings.currency)} saved</Text>
              <Text style={styles.mileSub}>{reached ? 'Reached 🎉' : `about day ${day}`}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function MoneySettings({
  settings, onChange,
}: { settings: SpendingSettings; onChange: (s: SpendingSettings) => void }) {
  const cur = CURRENCIES.find(c => c.code === settings.currency) ?? CURRENCIES[0];
  const freqs: [SpendingFrequency, string][] = [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']];

  const emit = (patch: Partial<SpendingSettings>) => {
    const next = { ...settings, ...patch };
    onChange({ ...next, trackingEnabled: (next.spendingAmount ?? 0) > 0 });
  };

  return (
    <View style={{ gap: 14 }}>
      <Text style={styles.section}>MONEY TRACKING</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingIcon}><PiggyBank size={19} color={colors.jade400} /></View>
          <Text style={styles.settingLabel}>Habit cost</Text>
        </View>
        <View style={[styles.settingRow, styles.rowDivider, { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
          <Text style={styles.fieldLbl}>Amount ({settings.spendingFrequency})</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              style={styles.curSmall}
              onPress={() => Alert.alert('Currency', undefined, [
                ...CURRENCIES.map(c => ({
                  text: `${c.sym} ${c.code}`,
                  onPress: () => emit({ currency: c.code }),
                })),
                { text: 'Cancel', style: 'cancel' as const },
              ])}
            >
              <Text style={styles.curSmallTxt}>{cur.sym} {cur.code}</Text>
            </Pressable>
            <View style={styles.amtSmall}>
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>{cur.sym}</Text>
              <TextInput
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textFaint}
                value={settings.spendingAmount ? settings.spendingAmount.toLocaleString() : ''}
                onChangeText={t => emit({ spendingAmount: Number(t.replace(/[^0-9]/g, '')) })}
                style={styles.amtSmallInput}
              />
            </View>
          </View>
        </View>
        <View style={[styles.settingRow, { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
          <Text style={styles.fieldLbl}>Frequency</Text>
          <View style={styles.segSmall}>
            {freqs.map(([k, l]) => {
              const on = settings.spendingFrequency === k;
              return (
                <Pressable key={k} onPress={() => emit({ spendingFrequency: k })}
                  style={[styles.segSmallItem, { backgroundColor: on ? colors.jade500 : 'transparent' }]}>
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: on ? colors.onAccent : colors.textMuted }}>{l}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
      <Text style={styles.disabledNote}>Enter the amount you used to spend — we'll show how much you're keeping.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  navTitle: { ...type.h1, fontSize: 24, color: colors.white },
  hero: { backgroundColor: 'rgba(20,184,136,0.12)', borderWidth: 1, borderColor: 'rgba(20,184,136,0.28)', borderRadius: radius.card, padding: 20, alignItems: 'center' },
  heroEyebrow: { fontSize: 13, color: colors.jade300, fontWeight: '600', letterSpacing: 1 },
  heroBig: { ...type.h1, fontSize: 46, color: colors.white, marginTop: 8 },
  heroSub: { fontSize: 13.5, color: colors.textMuted, marginTop: 6 },
  section: { fontSize: 13, fontWeight: '700', letterSpacing: 1.4, color: colors.textFaint, marginTop: 24, marginBottom: 12, marginHorizontal: 4 },
  projRow: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 15, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  projLbl: { fontSize: 15, color: colors.white },
  projVal: { ...type.h1, fontSize: 20, color: colors.jade300 },
  mileRow: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  mileIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mileTitle: { fontWeight: '700', fontSize: 15, color: colors.white },
  mileSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  settingsCard: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 18 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  settingIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,184,136,0.15)' },
  settingLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.white },
fieldLbl: { fontSize: 13, color: colors.textMuted },
  curSmall: { width: 84, height: 46, borderRadius: 12, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  curSmallTxt: { color: colors.white, fontWeight: '600', fontSize: 14 },
  amtSmall: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 46, borderRadius: 12, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, gap: 6 },
  amtSmallInput: { flex: 1, color: colors.white, fontWeight: '700', fontSize: 16 },
  segSmall: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface2, borderRadius: 12, padding: 4 },
  segSmallItem: { flex: 1, height: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  disabledNote: { fontSize: 12.5, color: colors.textFaint, marginHorizontal: 6, lineHeight: 19 },
});
