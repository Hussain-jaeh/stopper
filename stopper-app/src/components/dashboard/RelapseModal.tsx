import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { type } from '../../constants/typography';

const TRIGGERS = [
  { key: 'stress',      emoji: '😔', label: 'Stress' },
  { key: 'boredom',     emoji: '😴', label: 'Boredom' },
  { key: 'social',      emoji: '👥', label: 'Social' },
  { key: 'emotions',    emoji: '💔', label: 'Emotions' },
  { key: 'environment', emoji: '🏠', label: 'Environment' },
  { key: 'other',       emoji: '💭', label: 'Other' },
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (trigger: string, note?: string) => Promise<void>;
};

export function RelapseModal({ visible, onClose, onSubmit }: Props) {
  const [trigger, setTrigger] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = trigger !== null;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await onSubmit(trigger!, note.trim() || undefined);
      setTrigger(null);
      setNote('');
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>It happens. Reset & go again.</Text>
              <Text style={styles.subtitle}>Logging this helps you spot patterns. No judgment.</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionLabel}>What triggered it?</Text>
            <View style={styles.triggerGrid}>
              {TRIGGERS.map((t) => {
                const active = trigger === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setTrigger(t.key)}
                    style={[styles.triggerBtn, active && styles.triggerBtnActive]}
                    accessibilityRole="button"
                    accessibilityLabel={t.label}
                  >
                    <Text style={styles.triggerEmoji}>{t.emoji}</Text>
                    <Text style={[styles.triggerLabel, active && styles.triggerLabelActive]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>
              Note <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What happened? What will you do differently?"
              placeholderTextColor={colors.textFaint}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={280}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              style={[styles.submitBtn, (!canSubmit || loading) && { opacity: 0.4 }]}
            >
              <Text style={styles.submitText}>{loading ? 'Logging…' : 'Log relapse & restart streak'}</Text>
            </Pressable>

            <View style={{ height: spacing.lg }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.screenPad,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24 },
  title: { ...type.h1, color: colors.white, fontSize: 20 },
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, lineHeight: 19 },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  sectionLabel: { ...type.label, color: colors.textMuted, marginBottom: 12, fontWeight: '600', letterSpacing: 0.4 },
  optional: { color: colors.textFaint, fontWeight: '400' },
  triggerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  triggerBtn: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  triggerBtnActive: { borderColor: colors.coral400, backgroundColor: 'rgba(255,107,74,0.12)' },
  triggerEmoji: { fontSize: 22, marginBottom: 4 },
  triggerLabel: { ...type.label, color: colors.textMuted },
  triggerLabelActive: { color: colors.coral400 },
  noteInput: {
    ...type.body,
    color: colors.white,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitBtn: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.coral500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { ...type.button, color: colors.white, fontWeight: '700' },
});
