import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { type, fonts } from '../../constants/typography';
import { CURRENCIES, perDay, fmtMoney, SpendingFrequency } from '../../lib/money';

export type SpendingValue = { amount: number; frequency: SpendingFrequency; currency: string };

export function SpendingStep({
  value, onChange, onNext, onSkip,
}: { value: SpendingValue; onChange: (v: SpendingValue) => void; onNext: () => void; onSkip: () => void }) {
  const insets = useSafeAreaInsets();
  const cur = CURRENCIES.find(c => c.code === value.currency) ?? CURRENCIES[0];
  const freqs: [SpendingFrequency, string][] = [['daily', 'Per day'], ['weekly', 'Per week'], ['monthly', 'Per month']];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>What did the habit cost you?</Text>
        <Text style={styles.sub}>Optional — we'll turn it into money you're keeping. Change or remove it anytime.</Text>

        <View style={styles.amountRow}>
          <Pressable
            style={styles.curBox}
            onPress={() => Alert.alert('Currency', undefined, [
              ...CURRENCIES.map(c => ({
                text: `${c.sym} ${c.code}`,
                onPress: () => onChange({ ...value, currency: c.code }),
              })),
              { text: 'Cancel', style: 'cancel' as const },
            ])}
          >
            <Text style={styles.curTxt}>{cur.sym} {cur.code}</Text>
          </Pressable>
          <View style={styles.amtBox}>
            <Text style={styles.amtSym}>{cur.sym}</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              value={value.amount ? value.amount.toLocaleString() : ''}
              onChangeText={t => onChange({ ...value, amount: Number(t.replace(/[^0-9]/g, '')) })}
              style={styles.amtInput}
            />
          </View>
        </View>

        <View style={styles.segment}>
          {freqs.map(([k, l]) => {
            const on = value.frequency === k;
            return (
              <Pressable key={k} style={styles.segItem} onPress={() => onChange({ ...value, frequency: k })}>
                {on && <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />}
                <Text style={[styles.segTxt, { color: on ? colors.onAccent : colors.textMuted }]}>{l}</Text>
              </Pressable>
            );
          })}
        </View>

        {value.amount > 0 && (
          <View style={styles.preview}>
            <Text style={styles.previewLbl}>That's about</Text>
            <Text style={styles.previewBig}>
              {fmtMoney(perDay(value.amount, value.frequency) * 30, value.currency)}
              <Text style={styles.previewUnit}> / month</Text>
            </Text>
            <Text style={styles.previewSub}>you'll be keeping from now on.</Text>
          </View>
        )}
      </ScrollView>

      <View style={{ gap: 4 }}>
        <Pressable disabled={!value.amount} onPress={onNext} style={{ opacity: value.amount ? 1 : 0.45 }}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            <Text style={styles.ctaTxt}>Continue</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={onSkip} style={styles.skip}>
          <Text style={styles.skipTxt}>I don't want to track spending</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.screenPad, paddingBottom: spacing.lg },
  h1: { ...type.h1, textAlign: 'center', color: colors.white },
  sub: { ...type.body, color: colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 21 },
  amountRow: { flexDirection: 'row', gap: 10, marginTop: 30 },
  curBox: { width: 92, height: 60, borderRadius: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  curTxt: { color: colors.white, fontWeight: '600', fontSize: 15 },
  amtBox: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 60, borderRadius: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, gap: 6 },
  amtSym: { color: colors.textMuted, fontSize: 20, fontWeight: '600' },
  amtInput: { flex: 1, color: colors.white, fontFamily: fonts.display, fontWeight: '800', fontSize: 24 },
  segment: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 4, marginTop: 12 },
  segItem: { flex: 1, height: 44, borderRadius: 11, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  segTxt: { fontSize: 14, fontWeight: '700' },
  preview: { marginTop: 20, backgroundColor: 'rgba(20,184,136,0.10)', borderWidth: 1, borderColor: 'rgba(20,184,136,0.28)', borderRadius: radius.card, padding: 18, alignItems: 'center' },
  previewLbl: { fontSize: 13, color: colors.jade300, fontWeight: '600' },
  previewBig: { ...type.h1, fontSize: 30, color: colors.white, marginTop: 6 },
  previewUnit: { fontSize: 16, color: colors.textMuted },
  previewSub: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  cta: { height: 56, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  ctaTxt: { color: colors.onAccent, fontSize: 17, fontWeight: '800' },
  skip: { alignItems: 'center', paddingVertical: 10 },
  skipTxt: { color: colors.textMuted, fontSize: 15, fontWeight: '500' },
});
