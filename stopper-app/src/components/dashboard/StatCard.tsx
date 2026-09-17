import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Sticker } from '../stickers/Sticker';
import type { StickerKey } from '../stickers/iconMap';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

type Props = {
  label: string;
  value: string | number;
  /** Preferred: renders the branded gradient disc. */
  sticker?: StickerKey;
  /** Fallback for callers that haven't moved over yet. */
  Icon?: LucideIcon;
  tint?: string;
};

export function StatCard({ Icon, label, value, sticker, tint }: Props) {
  return (
    <View
      style={styles.card}
      accessibilityLabel={`${label}: ${value}`}
    >
      {sticker
        ? <Sticker name={sticker} size={38} shape="squircle" />
        : Icon
          ? (
            <View style={[styles.iconWrap, { backgroundColor: (tint ?? colors.jade500) + '29' }]}>
              <Icon size={20} color={tint ?? colors.jade500} />
            </View>
          )
          : null}
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, padding: 16, gap: 10,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  value: { ...type.statValue, color: colors.white },
  label: { ...type.label, color: colors.textMuted, marginTop: 5 },
});
