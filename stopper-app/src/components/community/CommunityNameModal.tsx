import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../../convex/_generated/api';
import { colors, gradients } from '../../constants/colors';
import { radius } from '../../constants/spacing';

/**
 * Asked once, on first community visit. Your community name is public;
 * the name from onboarding may be a real first name, so it's only a suggestion.
 */
export function CommunityNameModal({ visible, suggested }: { visible: boolean; suggested: string }) {
  const setName = useMutation(api.community.setCommunityName);
  const [name, setNameText] = useState(suggested);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (suggested) setNameText(n => n || suggested); }, [suggested]);

  const valid = /^[A-Za-z0-9_]{3,20}$/.test(name.trim());

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await setName({ name: name.trim() });
    } catch (e) {
      setError(e instanceof ConvexError ? String(e.data) : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Pick your community name</Text>
          <Text style={styles.sub}>
            This is what other members see on posts and the leaderboard. Use a nickname if you'd rather stay anonymous.
          </Text>
          <TextInput
            value={name}
            onChangeText={t => { setNameText(t.replace(/\s/g, '_')); setError(null); }}
            placeholder="e.g. SteadyRiver"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            style={styles.input}
          />
          <Text style={[styles.hint, error && { color: '#FF8A6B' }]}>
            {error ?? '3–20 letters, numbers or underscores'}
          </Text>
          <Pressable onPress={save} disabled={!valid || saving} style={{ opacity: valid ? 1 : 0.5 }}>
            <LinearGradient colors={gradients.primary} style={styles.cta}>
              {saving ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.ctaTxt}>Save name</Text>}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.surface1, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 22, gap: 12 },
  title: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 22, color: colors.white },
  sub: { fontSize: 14, lineHeight: 20, color: colors.textMuted },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.white, marginTop: 4 },
  hint: { fontSize: 12.5, color: colors.textFaint },
  cta: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  ctaTxt: { fontWeight: '700', fontSize: 16, color: colors.onAccent },
});
