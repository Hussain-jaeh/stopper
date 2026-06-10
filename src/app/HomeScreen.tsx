import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { useAuthActions } from '@convex-dev/auth/react';
import { Wordmark } from '../components/primitives';
import { colors, fonts } from '../theme/tokens';

export function HomeScreen() {
  const { signOut } = useAuthActions();

  return (
    <SafeAreaView style={styles.fill}>
      <View style={styles.screen}>
        <Wordmark size={28} />
        <View style={styles.content}>
          <Text style={styles.headline}>You're in.</Text>
          <Text style={styles.sub}>Main app coming soon.</Text>
        </View>
        <Pressable onPress={() => signOut()} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
    padding: 24,
    paddingTop: 18,
    paddingBottom: 40,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
    color: colors.white,
  },
  sub: {
    fontFamily: fonts.ui,
    fontSize: 17,
    color: colors.fgMuted,
  },
  signOutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  signOutText: {
    fontFamily: fonts.ui,
    fontSize: 15,
    fontWeight: '600',
    color: colors.fgMuted,
  },
});
