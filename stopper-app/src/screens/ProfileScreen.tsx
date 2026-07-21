import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Linking, Share, Alert,
  Modal, TextInput, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
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
  FileText, LogOut, Trash2, PiggyBank, X,
} from 'lucide-react-native';

import { api } from '../../convex/_generated/api';
import { ProfileStackParamList } from '../navigation/TabNavigator';
import { scheduleReminder, cancelReminder } from '../notifications/reminders';
import { ProfileIdentity } from '../components/profile/ProfileIdentity';
import { SettingsRow, SettingsGroup } from '../components/profile/SettingsRow';
import { DashboardSkeleton } from '../components/dashboard/states';
import { CURRENCIES, SpendingFrequency, fmtMoney, perDay } from '../lib/money';
import { colors } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';
import { type } from '../constants/typography';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const FREQS: [SpendingFrequency, string][] = [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']];

function HabitCostSheet({ visible, initial, onClose, onSave }: {
  visible: boolean;
  initial: { amount: number; freq: SpendingFrequency; currency: string };
  onClose: () => void;
  onSave: (amount: number, freq: SpendingFrequency, currency: string) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState(initial.amount ? String(initial.amount) : '');
  const [freq, setFreq] = useState<SpendingFrequency>(initial.freq);
  const [currency, setCurrency] = useState(initial.currency);
  const [saving, setSaving] = useState(false);
  const cur = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];
  const preview = Number(amount) > 0 ? perDay(Number(amount), freq) * 30 : 0;

  const handleSave = async () => {
    const n = Number(amount);
    if (!n) return;
    setSaving(true);
    try { await onSave(n, freq, currency); onClose(); } finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Habit cost</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <Text style={styles.sheetSub}>How much were you spending on this habit?</Text>

          <View style={styles.inputRow}>
            <Pressable
              style={styles.curBtn}
              onPress={() => Alert.alert('Currency', undefined, [
                ...CURRENCIES.map(c => ({ text: `${c.sym} ${c.code}`, onPress: () => setCurrency(c.code) })),
                { text: 'Cancel', style: 'cancel' as const },
              ])}
            >
              <Text style={styles.curTxt}>{cur.sym} {cur.code}</Text>
            </Pressable>
            <View style={styles.amtBox}>
              <Text style={styles.amtSym}>{cur.sym}</Text>
              <TextInput
                autoFocus
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textFaint}
                value={amount}
                onChangeText={t => setAmount(t.replace(/[^0-9]/g, ''))}
                style={styles.amtInput}
              />
            </View>
          </View>

          <View style={styles.segRow}>
            {FREQS.map(([k, l]) => (
              <Pressable key={k} onPress={() => setFreq(k)}
                style={[styles.segItem, { backgroundColor: freq === k ? colors.jade500 : colors.surface2 }]}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: freq === k ? colors.onAccent : colors.textMuted }}>{l}</Text>
              </Pressable>
            ))}
          </View>

          {preview > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewTxt}>
                That's{' '}
                <Text style={{ color: colors.jade300, fontWeight: '700' }}>{fmtMoney(preview, currency)}/month</Text>
                {' '}you'll be keeping.
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleSave}
            disabled={!amount || saving}
            style={[styles.saveBtn, { opacity: amount && !saving ? 1 : 0.45, marginTop: 28 }]}
          >
            <Text style={styles.saveBtnTxt}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuthActions();

  const p = useQuery(api.profile.getProfile);
  const recoveryProfile = useQuery(api.profiles.getProfile);
  const updateSetting = useMutation(api.profile.updateSetting);
  const updateSpending = useMutation(api.profiles.updateSpending);
  const deleteAccount = useMutation(api.account.deleteAccount);
  const generateUploadUrl = useMutation(api.profile.generateAvatarUploadUrl);
  const saveAvatar = useMutation(api.profile.saveAvatar);

  const [local, setLocal] = useState<{ remindersOn?: boolean; anonymous?: boolean; appLockEnabled?: boolean }>({});
  const [costSheetOpen, setCostSheetOpen] = useState(false);
  const val = (k: 'remindersOn' | 'anonymous' | 'appLockEnabled'): boolean => local[k] ?? p?.[k] ?? false;

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
      const upload = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: 'POST',
        headers: { 'Content-Type': mimeType ?? 'image/jpeg' },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });
      if (upload.status !== 200) throw new Error(`Upload failed (${upload.status})`);
      const { storageId } = JSON.parse(upload.body);
      await saveAvatar({ storageId });
    } catch (err: unknown) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : String(err));
    }
  };

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
        Alert.alert('Biometrics unavailable', 'Set up Face ID or Touch ID in your device Settings first.', [{ text: 'OK' }]);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authenticate to enable App Lock', cancelLabel: 'Cancel' });
      if (!result.success) return;
    }
    setLocal(s => ({ ...s, appLockEnabled: v }));
    updateSetting({ key: 'appLockEnabled', value: v });
  };

  const handleShare = () => {
    Share.share({ message: 'I\'m using Stopper to track my recovery — every day counts. 🌱', url: 'https://stopper.mintlify.io' });
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete account', 'This permanently deletes your recovery data, streaks, and community activity. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () =>
        Alert.alert('Are you sure?', 'All your data will be gone forever.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, delete everything', style: 'destructive', onPress: async () => { await deleteAccount(); signOut(); } },
        ]),
      },
    ]);
  };

  const handleSaveSpending = async (amount: number, freq: SpendingFrequency, currency: string) => {
    await updateSpending({ spendingAmount: amount, spendingFrequency: freq, currency, trackingEnabled: true });
  };

  const habitCostLabel = recoveryProfile?.spendingAmount
    ? `${CURRENCIES.find(c => c.code === (recoveryProfile.currency ?? 'USD'))?.sym ?? ''}${recoveryProfile.spendingAmount.toLocaleString()} / ${recoveryProfile.spendingFrequency ?? 'monthly'}`
    : 'Not set';

  return (
    <>
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
                <SettingsRow Icon={Bell} tint={colors.gold} label="Daily reminders" toggle on={val('remindersOn')} onToggle={handleRemindersToggle} />
                <SettingsRow Icon={PiggyBank} tint={colors.jade400} label="Habit cost" value={habitCostLabel} chevron onPress={() => setCostSheetOpen(true)} last />
              </SettingsGroup>

              <SettingsGroup title="Privacy">
                <SettingsRow Icon={VenetianMask} tint="#9B6FE4" label="Stay anonymous" toggle on={val('anonymous')} onToggle={handleAnonymousToggle} />
                <SettingsRow Icon={Lock} tint="#2E7DD1" label="App lock" toggle on={val('appLockEnabled')} onToggle={handleAppLockToggle} last />
              </SettingsGroup>

              <SettingsGroup title="About">
                <SettingsRow Icon={Smartphone} tint={colors.textMuted} label="Version" value="1.0.0" />
                <SettingsRow Icon={Star} tint={colors.coral400} label="Rate Stopper" external onPress={async () => {
                  if (await StoreReview.hasAction()) { StoreReview.requestReview(); }
                  else { Linking.openURL('https://apps.apple.com/app/stopper'); }
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

      <HabitCostSheet
        visible={costSheetOpen}
        initial={{
          amount: recoveryProfile?.spendingAmount ?? 0,
          freq: (recoveryProfile?.spendingFrequency as SpendingFrequency) ?? 'monthly',
          currency: recoveryProfile?.currency ?? 'USD',
        }}
        onClose={() => setCostSheetOpen(false)}
        onSave={handleSaveSpending}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.screenPad },
  title: { ...type.h1, fontSize: 30, color: colors.white, marginTop: 8 },
  footer: { textAlign: 'center', fontSize: 13, color: colors.textFaint, paddingTop: 30 },

  sheet: { flex: 1, backgroundColor: colors.bg, padding: spacing.screenPad, paddingTop: 28 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  sheetSub: { fontSize: 14, color: colors.textMuted, marginBottom: 28 },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  curBtn: { width: 96, height: 58, borderRadius: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  curTxt: { color: colors.white, fontWeight: '600', fontSize: 14 },
  amtBox: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 58, borderRadius: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, gap: 8 },
  amtSym: { color: colors.textMuted, fontSize: 20, fontWeight: '600' },
  amtInput: { flex: 1, color: colors.white, fontWeight: '800', fontSize: 26 },

  segRow: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 4 },
  segItem: { flex: 1, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  preview: { marginTop: 18, padding: 16, backgroundColor: 'rgba(20,184,136,0.10)', borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(20,184,136,0.25)' },
  previewTxt: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  saveBtn: { height: 56, borderRadius: 30, backgroundColor: colors.jade500, alignItems: 'center', justifyContent: 'center' },
  saveBtnTxt: { color: colors.onAccent, fontSize: 17, fontWeight: '800' },
});
