import React, { createContext, useContext, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { UserPlus } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { colors, fonts, radii } from '../theme/tokens';

interface GuestUpgradeValue {
  /** True while the user is using Stopper without having registered. */
  isGuest: boolean;
  /** Opens registration, carrying the guest's existing data across. */
  startUpgrade: () => void;
}

const GuestUpgradeContext = createContext<GuestUpgradeValue>({
  isGuest: false,
  startUpgrade: () => {},
});

export function GuestUpgradeProvider({
  onStartUpgrade,
  children,
}: {
  onStartUpgrade: () => void;
  children: React.ReactNode;
}) {
  const status = useQuery(api.guest.getAccountStatus);
  const value = useMemo(
    () => ({ isGuest: status?.isGuest ?? false, startUpgrade: onStartUpgrade }),
    [status?.isGuest, onStartUpgrade],
  );
  return <GuestUpgradeContext.Provider value={value}>{children}</GuestUpgradeContext.Provider>;
}

export function useGuestUpgrade() {
  return useContext(GuestUpgradeContext);
}

/**
 * Shown in place of features that are genuinely account-specific — anything
 * that publishes to or reads from other people. Everything a user keeps to
 * themselves works without an account and is never gated by this.
 */
export function GuestGate({ title, message }: { title: string; message: string }) {
  const { startUpgrade } = useGuestUpgrade();
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <UserPlus size={26} color={colors.jade300} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.msg}>{message}</Text>
      <Pressable
        onPress={startUpgrade}
        accessibilityRole="button"
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.75 }]}
      >
        <Text style={styles.ctaTxt}>Create a free account</Text>
      </Pressable>
      <Text style={styles.fine}>Your streak, check-ins and vault come with you.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, backgroundColor: colors.bg },
  icon: {
    width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(45,212,168,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,168,0.25)',
  },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 21, color: colors.white, marginTop: 18, textAlign: 'center' },
  msg: { fontFamily: fonts.ui, fontSize: 15, color: colors.fgMuted, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  cta: {
    marginTop: 22, height: 50, paddingHorizontal: 28, borderRadius: radii.pill,
    backgroundColor: colors.jade500, alignItems: 'center', justifyContent: 'center',
  },
  ctaTxt: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: '700', color: colors.white },
  fine: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.fgFaint, marginTop: 12, textAlign: 'center' },
});
