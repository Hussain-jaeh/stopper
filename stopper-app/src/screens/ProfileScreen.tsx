import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import {
  Target, Bell, VenetianMask, Lock, Smartphone, Star, Share2, ShieldCheck,
  FileText, LogOut, Trash2,
} from 'lucide-react-native';

import { api } from '../../../convex/_generated/api';
import { ProfileIdentity } from '../components/profile/ProfileIdentity';
import { SettingsRow, SettingsGroup } from '../components/profile/SettingsRow';
import { DashboardSkeleton } from '../components/dashboard/states';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { type } from '../constants/typography';

type SettingKey = 'remindersOn' | 'anonymous';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthActions();

  const p = useQuery(api.profile.getProfile);
  const updateSetting = useMutation(api.profile.updateSetting);

  const [local, setLocal] = useState<Partial<Record<SettingKey, boolean>>>({});
  const val = (k: SettingKey): boolean => local[k] ?? p?.[k] ?? false;
  const setToggle = (key: SettingKey) => (v: boolean) => {
    setLocal(s => ({ ...s, [key]: v }));
    updateSetting({ key, value: v });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 4, paddingBottom: insets.bottom + 96 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Profile</Text>

      {p === undefined ? (
        <View style={{ marginTop: 24 }}><DashboardSkeleton /></View>
      ) : p === null ? (
        <View style={{ marginTop: 24 }}><DashboardSkeleton /></View>
      ) : (
        <>
          <ProfileIdentity name={p.name} tagline={p.tagline} avatarUri={p.avatarUri} index={1} />

          <View style={{ gap: 26 }}>
            <SettingsGroup title="Recovery">
              <SettingsRow Icon={Target} tint={colors.jade500} label="My plan & goals" chevron onPress={() => {}} />
              <SettingsRow Icon={Bell} tint={colors.gold} label="Daily reminders" toggle on={val('remindersOn')} onToggle={setToggle('remindersOn')} last />
            </SettingsGroup>

            <SettingsGroup title="Privacy">
              <SettingsRow Icon={VenetianMask} tint="#9B6FE4" label="Stay anonymous" toggle on={val('anonymous')} onToggle={setToggle('anonymous')} />
              <SettingsRow Icon={Lock} tint="#2E7DD1" label="App lock" chevron onPress={() => {}} last />
            </SettingsGroup>

            <SettingsGroup title="About">
              <SettingsRow Icon={Smartphone} tint={colors.textMuted} label="Version" value="1.0.0" />
              <SettingsRow Icon={Star} tint={colors.coral400} label="Rate Stopper" external onPress={() => {}} />
              <SettingsRow Icon={Share2} tint="#2BB6C4" label="Share Stopper" chevron onPress={() => {}} />
              <SettingsRow Icon={ShieldCheck} tint="#2E7DD1" label="Privacy Policy" external onPress={() => Linking.openURL('https://hussain-jaeh.github.io/stopper/privacy/')} />
              <SettingsRow Icon={FileText} tint="#9B6FE4" label="Terms of Service" external onPress={() => Linking.openURL('https://hussain-jaeh.github.io/stopper/terms/')} last />
            </SettingsGroup>

            <SettingsGroup>
              <SettingsRow Icon={LogOut} tint={colors.textMuted} label="Sign out" danger onPress={() => signOut()} />
              <SettingsRow Icon={Trash2} tint={colors.textMuted} label="Delete account" danger external onPress={() => {}} last />
            </SettingsGroup>
          </View>

          <Text style={styles.footer}>Made with care for your recovery</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.screenPad },
  title: { ...type.h1, fontSize: 30, color: colors.white, marginTop: 8 },
  footer: { textAlign: 'center', fontSize: 13, color: colors.textFaint, paddingTop: 30 },
});
