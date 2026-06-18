import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Linking, Share, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import * as StoreReview from 'expo-store-review';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  Target, Bell, VenetianMask, Lock, Smartphone, Star, Share2, ShieldCheck,
  FileText, LogOut, Trash2,
} from 'lucide-react-native';

import { api } from '../../convex/_generated/api.js';
import { ProfileStackParamList } from '../navigation/TabNavigator';
import { scheduleReminder, cancelReminder } from '../notifications/reminders';
import { ProfileIdentity } from '../components/profile/ProfileIdentity';
import { SettingsRow, SettingsGroup } from '../components/profile/SettingsRow';
import { DashboardSkeleton } from '../components/dashboard/states';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { type } from '../constants/typography';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuthActions();

  const p = useQuery(api.profile.getProfile);
  const updateSetting = useMutation(api.profile.updateSetting);
  const deleteAccount = useMutation(api.account.deleteAccount);
  const generateUploadUrl = useMutation(api.profile.generateAvatarUploadUrl);
  const saveAvatar = useMutation(api.profile.saveAvatar);

  const [local, setLocal] = useState<{ remindersOn?: boolean; anonymous?: boolean; appLockEnabled?: boolean }>({});
  const val = (k: 'remindersOn' | 'anonymous' | 'appLockEnabled'): boolean => local[k] ?? p?.[k] ?? false;

  // ── Avatar upload ─────────────────────────────────────────────────────────

  const handleEditAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const { uri, mimeType } = result.assets[0];
    try {
      const uploadUrl = await generateUploadUrl();
      console.log('[avatar] uploadUrl:', uploadUrl);
      console.log('[avatar] uri:', uri, 'mimeType:', mimeType);
      const upload = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: 'POST',
        headers: { 'Content-Type': mimeType ?? 'image/jpeg' },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });
      console.log('[avatar] upload status:', upload.status, 'body:', upload.body);
      if (upload.status !== 200) throw new Error(`Upload HTTP ${upload.status}: ${upload.body}`);
      const { storageId } = JSON.parse(upload.body);
      await saveAvatar({ storageId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[avatar] error:', msg);
      Alert.alert('Upload failed', msg);
    }
  };

  // ── Toggles ──────────────────────────────────────────────────────────────

  const handleRemindersToggle = async (v: boolean) => {
    if (v) {
      const granted = await scheduleReminder();
      if (!granted) return;
    } else {
      await cancelReminder();
    }
    setLocal(s => ({ ...s, remindersOn: v }));
    updateSetting({ key: 'remindersOn', value: v });
  };

  const handleAnonymousToggle = (v: boolean) => {
    setLocal(s => ({ ...s, anonymous: v }));
    updateSetting({ key: 'anonymous', value: v });
  };

  const handleAppLockToggle = async (v: boolean) => {
    if (v) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        Alert.alert(
          'Biometrics unavailable',
          'Set up Face ID or Touch ID in your device Settings first.',
          [{ text: 'OK' }],
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable App Lock',
        cancelLabel: 'Cancel',
      });
      if (!result.success) return;
    }
    setLocal(s => ({ ...s, appLockEnabled: v }));
    updateSetting({ key: 'appLockEnabled', value: v });
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleShare = () => {
    Share.share({
      message: 'I\'m using Stopper to track my recovery — every day counts. 🌱',
      url: 'https://stopper.mintlify.io',
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your recovery data, streaks, and community activity. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Are you sure?',
              'All your data will be gone forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, delete everything',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteAccount();
                    signOut();
                  },
                },
              ],
            ),
        },
      ],
    );
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
          <ProfileIdentity name={p.name} tagline={p.tagline} avatarUri={p.avatarUri ?? undefined} onEditAvatar={handleEditAvatar} index={1} />

          <View style={{ gap: 26 }}>
            <SettingsGroup title="Recovery">
              <SettingsRow Icon={Target} tint={colors.jade500} label="My plan & goals" chevron onPress={() => navigation.navigate('Plan')} />
              <SettingsRow Icon={Bell} tint={colors.gold} label="Daily reminders" toggle on={val('remindersOn')} onToggle={handleRemindersToggle} last />
            </SettingsGroup>

            <SettingsGroup title="Privacy">
              <SettingsRow Icon={VenetianMask} tint="#9B6FE4" label="Stay anonymous" toggle on={val('anonymous')} onToggle={handleAnonymousToggle} />
              <SettingsRow Icon={Lock} tint="#2E7DD1" label="App lock" toggle on={val('appLockEnabled')} onToggle={handleAppLockToggle} last />
            </SettingsGroup>

            <SettingsGroup title="About">
              <SettingsRow Icon={Smartphone} tint={colors.textMuted} label="Version" value="1.0.0" />
              <SettingsRow Icon={Star} tint={colors.coral400} label="Rate Stopper" external onPress={async () => {
                if (await StoreReview.hasAction()) {
                  StoreReview.requestReview();
                } else {
                  Linking.openURL('https://apps.apple.com/app/stopper');
                }
              }} />
              <SettingsRow Icon={Share2} tint="#2BB6C4" label="Share Stopper" chevron onPress={handleShare} />
              <SettingsRow Icon={ShieldCheck} tint="#2E7DD1" label="Privacy Policy" external onPress={() => Linking.openURL('https://stopper.mintlify.io/legal/privacy')} />
              <SettingsRow Icon={FileText} tint="#9B6FE4" label="Terms of Service" external onPress={() => Linking.openURL('https://stopper.mintlify.io/legal/terms')} last />
            </SettingsGroup>

            <SettingsGroup>
              <SettingsRow Icon={LogOut} tint={colors.textMuted} label="Sign out" danger onPress={() => signOut()} />
              <SettingsRow Icon={Trash2} tint={colors.textMuted} label="Delete account" danger external onPress={handleDeleteAccount} last />
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
