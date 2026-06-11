import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { type } from '../constants/typography';

export function CommunityScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <View style={styles.icon}><Users size={40} color={colors.jade400} /></View>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.sub}>Connect with others on the same journey.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  icon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accentGlowSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { ...type.h1, color: colors.white },
  sub: { ...type.subtitle, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
