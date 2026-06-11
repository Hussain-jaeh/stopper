import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { colors, gradients } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { type } from '../../constants/typography';

const MOODS = [
  { key: 'great',    emoji: '😊', label: 'Great' },
  { key: 'good',     emoji: '🙂', label: 'Good' },
  { key: 'okay',     emoji: '😐', label: 'Okay' },
  { key: 'bad',      emoji: '😕', label: 'Bad' },
  { key: 'terrible', emoji: '😣', label: 'Terrible' },
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (mood: string, cravingLevel: number, note?: string) => Promise<void>;
};

export function CheckInModal({ visible, onClose, onSubmit }: Props) {
  const [mood, setMood] = useState<string | null>(null);
  const [craving, setCraving] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = mood !== null && craving !== null;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await onSubmit(mood!, craving!, note.trim() || undefined);
      setMood(null);
      setCraving(null);
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
            <Text style={styles.title}>How are you feeling?</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Mood */}
            <Text style={styles.sectionLabel}>Mood</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => setMood(m.key)}
                  style={[styles.moodBtn, mood === m.key && styles.moodBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={m.label}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, mood === m.key && styles.moodLabelActive]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Craving level */}
            <Text style={styles.sectionLabel}>
              Craving level{craving !== null ? <Text style={styles.cravingVal}> — {craving}/10</Text> : ''}
            </Text>
            <View style={styles.cravingRow}>
              {Array.from({ length: 11 }, (_, i) => (
                <Pressable
                  key={i}
                  onPress={() => setCraving(i)}
                  style={[styles.cravingBtn, craving === i && styles.cravingBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Craving level ${i}`}
                >
                  <Text style={[styles.cravingNum, craving === i && styles.cravingNumActive]}>{i}</Text>
                </Pressable>
              ))}
            </View>

            {/* Optional note */}
            <Text style={styles.sectionLabel}>Note <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What triggered the craving? How did you cope?"
              placeholderTextColor={colors.textFaint}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={280}
            />

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              style={[styles.submitWrap, (!canSubmit || loading) && styles.submitDisabled]}
            >
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>{loading ? 'Saving…' : 'Log check-in'}</Text>
              </LinearGradient>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { ...type.h1, color: colors.white },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { ...type.label, color: colors.textMuted, marginBottom: 12, fontWeight: '600', letterSpacing: 0.4 },
  optional: { color: colors.textFaint, fontWeight: '400' },
  moodRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  moodBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.card,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
  },
  moodBtnActive: { borderColor: colors.jade400, backgroundColor: 'rgba(20,184,136,0.12)' },
  moodEmoji: { fontSize: 22 },
  moodLabel: { ...type.label, color: colors.textMuted, marginTop: 5 },
  moodLabelActive: { color: colors.jade300 },
  cravingRow: { flexDirection: 'row', gap: 6, marginBottom: 24, flexWrap: 'wrap' },
  cravingBtn: {
    width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
  },
  cravingBtnActive: { borderColor: colors.coral400, backgroundColor: 'rgba(255,107,74,0.14)' },
  cravingNum: { ...type.label, color: colors.textMuted, fontWeight: '600' },
  cravingNumActive: { color: colors.coral400 },
  cravingVal: { color: colors.coral400 },
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
  submitWrap: { borderRadius: radius.pill, overflow: 'hidden' },
  submitDisabled: { opacity: 0.45 },
  submitGradient: { height: 58, alignItems: 'center', justifyContent: 'center' },
  submitText: { ...type.button, color: colors.white, fontWeight: '700' },
});
