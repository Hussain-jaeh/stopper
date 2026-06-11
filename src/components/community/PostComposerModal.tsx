import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, LucideIcon, Smartphone, Cigarette, Brain, Wine, Moon } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { type } from '../../constants/typography';

type Circle = { id: string; name: string; iconKey: string; tint: string };

const CIRCLE_ICONS: Record<string, LucideIcon> = {
  digital: Smartphone, vaping: Cigarette, mindful: Brain, alcohol: Wine, night: Moon,
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (body: string, circleId?: string) => Promise<void>;
  myHandle: string;
  circles: Circle[];
}

export function PostComposerModal({ visible, onClose, onSubmit, myHandle, circles }: Props) {
  const insets = useSafeAreaInsets();
  const [body, setBody] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const canPost = body.trim().length > 0;

  const handlePost = async () => {
    if (!canPost || loading) return;
    setLoading(true);
    try {
      await onSubmit(body.trim(), selectedCircle);
      setBody('');
      setSelectedCircle(undefined);
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
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
            <Text style={styles.title}>New post</Text>
            <Pressable
              onPress={handlePost}
              disabled={!canPost || loading}
              accessibilityRole="button"
              style={[styles.postBtn, (!canPost || loading) && styles.postBtnDisabled]}
            >
              <Text style={[styles.postBtnTxt, (!canPost || loading) && { opacity: 0.4 }]}>
                {loading ? 'Posting…' : 'Post'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            {/* Compose area */}
            <View style={styles.compose}>
              <Avatar handle={myHandle} tint={colors.jade500} size={42} />
              <TextInput
                style={styles.input}
                placeholder="Share a win, struggle, or words of support…"
                placeholderTextColor={colors.textFaint}
                multiline
                autoFocus
                value={body}
                onChangeText={setBody}
                maxLength={500}
              />
            </View>

            {/* Circle picker */}
            {circles.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Post to a circle (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.circleRow}>
                  {circles.map(c => {
                    const Icon = CIRCLE_ICONS[c.iconKey] ?? Smartphone;
                    const on = selectedCircle === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setSelectedCircle(on ? undefined : c.id)}
                        style={[styles.circleChip, on && { borderColor: c.tint, backgroundColor: c.tint + '22' }]}
                      >
                        <Icon size={14} color={on ? c.tint : colors.textMuted} />
                        <Text style={[styles.circleChipTxt, { color: on ? c.tint : colors.textMuted }]}>{c.name}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screenPad, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.body, fontWeight: '700', color: colors.white },
  postBtn: { backgroundColor: colors.jade500, paddingHorizontal: 20, paddingVertical: 9, borderRadius: radius.pill },
  postBtnDisabled: { backgroundColor: colors.surface3 },
  postBtnTxt: { fontWeight: '700', fontSize: 14, color: colors.onAccent },
  compose: { flexDirection: 'row', gap: 14, padding: spacing.screenPad, paddingBottom: 8 },
  input: { flex: 1, fontSize: 16, color: colors.white, lineHeight: 24, minHeight: 120, textAlignVertical: 'top' },
  section: { paddingHorizontal: spacing.screenPad, paddingTop: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textFaint, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  circleRow: { gap: 8, paddingBottom: 4 },
  circleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface1 },
  circleChipTxt: { fontSize: 13, fontWeight: '600' },
});
