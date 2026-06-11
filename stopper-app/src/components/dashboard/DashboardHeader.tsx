import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { type } from '../../constants/typography';

function greetingFor(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardHeader({ name, index = 0 }: { name: string; index?: number }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>{greetingFor()},</Text>
        <Text style={styles.name} accessibilityRole="header">{name} 👋</Text>
        <Text style={styles.sub}>Keep going. You're making progress.</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{name.slice(0, 1).toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  greeting: { ...type.subtitle, color: colors.textMuted, fontWeight: '500' },
  name: { ...type.h1, color: colors.white, marginTop: 3 },
  sub: { ...type.label, color: colors.textMuted, marginTop: 8 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border },
  avatarTxt: { ...type.cardTitle, color: colors.jade300 },
});
