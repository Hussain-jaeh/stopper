import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { ChevronRight, ExternalLink, LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';

function tintBg(hex: string, a = 0.15) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

type RowProps = {
  Icon: LucideIcon;
  tint: string;
  label: string;
  value?: string;
  toggle?: boolean;
  on?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  chevron?: boolean;
  external?: boolean;
  danger?: boolean;
  last?: boolean;
};

export function SettingsRow({
  Icon, tint, label, value, toggle, on, onToggle, onPress, chevron, external, danger, last,
}: RowProps) {
  const labelColor = danger ? colors.coral500 : colors.white;
  const iconColor = danger ? colors.coral500 : tint;
  const iconBg = danger ? 'rgba(255,107,74,0.13)' : tintBg(tint);

  const body = (
    <View style={[styles.row, !last && styles.divider]}>
      <View style={[styles.icon, { backgroundColor: iconBg }]}>
        <Icon size={19} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {toggle ? (
        <Switch value={on} onValueChange={onToggle}
          trackColor={{ false: colors.surface3, true: colors.jade500 }}
          thumbColor={colors.white} ios_backgroundColor={colors.surface3} />
      ) : external ? (
        <ExternalLink size={17} color={danger ? colors.coral500 : colors.textFaint} />
      ) : chevron ? (
        <ChevronRight size={18} color={colors.textFaint} />
      ) : null}
    </View>
  );

  if (toggle) return body;
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>{body}</Pressable>
  );
}

export function SettingsGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={styles.group}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupTitle: { fontSize: 12.5, fontWeight: '700', letterSpacing: 1.4, color: colors.textFaint, marginHorizontal: 6, marginBottom: 12, textTransform: 'uppercase' },
  group: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18, paddingVertical: 17 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 16, fontWeight: '500' },
  value: { fontSize: 15, color: colors.textMuted },
});
