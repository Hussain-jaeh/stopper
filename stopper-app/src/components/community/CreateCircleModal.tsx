import { useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Smartphone, Cigarette, Brain, Wine, Moon, Dumbbell, Heart, Coffee, LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { type } from '../../constants/typography';

const ICONS: { key: string; Icon: LucideIcon; label: string }[] = [
  { key: 'alcohol',  Icon: Wine,       label: 'Alcohol' },
  { key: 'vaping',   Icon: Cigarette,  label: 'Vaping' },
  { key: 'digital',  Icon: Smartphone, label: 'Digital' },
  { key: 'mindful',  Icon: Brain,      label: 'Mental' },
  { key: 'night',    Icon: Moon,       label: 'Sleep' },
  { key: 'fitness',  Icon: Dumbbell,   label: 'Fitness' },
  { key: 'health',   Icon: Heart,      label: 'Health' },
  { key: 'caffeine', Icon: Coffee,     label: 'Caffeine' },
];

const TINTS = [
  '#2E7DD1', '#9B6FE4', '#14B888', '#F2B23E',
  '#FF6B4A', '#E44F6E', '#3DBFA8', '#8B5CF6',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, iconKey: string, tint: string, description?: string) => Promise<void>;
};

export function CreateCircleModal({ visible, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconKey, setIconKey] = useState('mindful');
  const [tint, setTint] = useState(TINTS[0]);
  const [loading, setLoading] = useState(false);

  const canCreate = name.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate || loading) return;
    setLoading(true);
    try {
      await onSubmit(name.trim(), iconKey, tint, description.trim() || undefined);
      setName('');
      setDescription('');
      setIconKey('mindful');
      setTint(TINTS[0]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
            <Text style={styles.title}>Create a circle</Text>
            <Pressable
              onPress={handleCreate}
              disabled={!canCreate || loading}
              style={[styles.createBtn, (!canCreate || loading) && styles.createBtnDisabled]}
            >
              <Text style={[styles.createBtnTxt, (!canCreate || loading) && { opacity: 0.4 }]}>
                {loading ? 'Creating…' : 'Create'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.body}>
              {/* Name */}
              <Text style={styles.label}>Circle name</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="e.g. Quit Smoking Together"
                placeholderTextColor={colors.textFaint}
                value={name}
                onChangeText={setName}
                maxLength={40}
                autoFocus
              />

              {/* Description */}
              <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={[styles.nameInput, { minHeight: 60, textAlignVertical: 'top' }]}
                placeholder="What's this circle about?"
                placeholderTextColor={colors.textFaint}
                value={description}
                onChangeText={setDescription}
                maxLength={120}
                multiline
              />

              {/* Icon picker */}
              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconGrid}>
                {ICONS.map(({ key, Icon, label }) => {
                  const on = iconKey === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setIconKey(key)}
                      style={[styles.iconBtn, on && { borderColor: tint, backgroundColor: tint + '22' }]}
                    >
                      <Icon size={22} color={on ? tint : colors.textMuted} />
                      <Text style={[styles.iconLabel, { color: on ? tint : colors.textFaint }]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Color picker */}
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorRow}>
                {TINTS.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTint(t)}
                    style={[styles.colorDot, { backgroundColor: t }, tint === t && styles.colorDotSelected]}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPad, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.body, fontWeight: '700', color: colors.white },
  createBtn: { backgroundColor: colors.jade500, paddingHorizontal: 20, paddingVertical: 9, borderRadius: radius.pill },
  createBtnDisabled: { backgroundColor: colors.surface3 },
  createBtnTxt: { fontWeight: '700', fontSize: 14, color: colors.onAccent },
  body: { padding: spacing.screenPad, gap: 8 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textFaint, marginBottom: 8, marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 },
  optional: { fontWeight: '400', textTransform: 'none', letterSpacing: 0 },
  nameInput: {
    fontSize: 15, color: colors.white,
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, padding: 14, marginBottom: 4,
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: '22%', flexGrow: 1,
    alignItems: 'center', paddingVertical: 12, borderRadius: radius.card,
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, gap: 6,
  },
  iconLabel: { fontSize: 11, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 24 },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  colorDotSelected: { borderWidth: 3, borderColor: colors.white },
});
