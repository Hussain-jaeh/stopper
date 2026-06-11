import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { User, LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthActions } from '@convex-dev/auth/react';
import { colors } from '../constants/colors';
import { radius } from '../constants/spacing';
import { type } from '../constants/typography';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthActions();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <View style={styles.avatar}><User size={40} color={colors.jade400} /></View>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.sub}>Your account settings and stats will live here.</Text>
      </View>

      <Pressable onPress={() => signOut()} style={[styles.signOut, { marginBottom: insets.bottom + 24 }]}>
        <LogOut size={18} color={colors.textMuted} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accentGlowSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { ...type.h1, color: colors.white },
  sub: { ...type.subtitle, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong },
  signOutText: { ...type.body, color: colors.textMuted, fontWeight: '600' },
});
