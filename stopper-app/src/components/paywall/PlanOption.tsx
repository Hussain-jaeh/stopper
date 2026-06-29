import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radii } from '../../theme/tokens';
import { RCPlan } from '../../lib/purchases';

type Props = { plan: RCPlan; selected: boolean; onSelect: (id: string) => void };

export function PlanOption({ plan, selected, onSelect }: Props) {
  return (
    <Pressable
      onPress={() => onSelect(plan.id)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${plan.label}, ${plan.subLabel}`}
      style={[styles.card, selected ? styles.cardOn : styles.cardOff]}
    >
      {plan.best && plan.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{plan.badge}</Text>
        </View>
      ) : null}

      <View style={[
        styles.radio,
        {
          borderColor: selected ? colors.jade500 : '#4a4a4a',
          backgroundColor: selected ? colors.jade500 : 'transparent',
        },
      ]}>
        {selected ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{plan.label}</Text>
        <Text style={styles.sub}>{plan.subLabel}</Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.price}>{plan.priceString}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: radii.lg, paddingVertical: 17, paddingHorizontal: 18, borderWidth: 2 },
  cardOn: { backgroundColor: 'rgba(20,184,136,0.12)', borderColor: colors.jade500 },
  cardOff: { backgroundColor: colors.surface1, borderColor: colors.border },
  badge: { position: 'absolute', top: -11, right: 16, backgroundColor: colors.jade500, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeTxt: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.white },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: colors.white },
  sub: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: colors.fgMuted, marginTop: 3 },
  price: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 19, color: colors.white },
});
