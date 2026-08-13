import React, { useState, useRef } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { X, Send } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { api } from '../../../convex/_generated/api';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';

interface Props {
  postId: string | null;
  onClose: () => void;
}

export function CommentSheet({ postId, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const me = useQuery(api.community.getMe);
  const comments = useQuery(
    api.community.getPostComments,
    postId ? { postId: postId as any } : 'skip',
  );
  const addComment = useMutation(api.community.addComment);

  const handleSend = async () => {
    if (!text.trim() || !postId || posting) return;
    setPosting(true);
    try {
      await addComment({ postId: postId as any, body: text.trim() });
      setText('');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal
      visible={!!postId}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {comments === undefined ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.jade500} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>No comments yet — be the first to reply.</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              style={{ flex: 1 }}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <View style={styles.comment}>
                  <Avatar handle={item.handle} size={34} tint={colors.jade500} />
                  <View style={styles.bubble}>
                    <View style={styles.commentHead}>
                      <Text style={styles.handle}>{item.handle}</Text>
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                    <Text style={styles.body}>{item.body}</Text>
                  </View>
                </View>
              )}
            />
          )}

          <View style={styles.inputRow}>
            <Avatar handle={me?.handle ?? ''} size={34} tint={colors.jade500} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Add a comment…"
              placeholderTextColor={colors.textFaint}
              value={text}
              onChangeText={setText}
              maxLength={300}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <Pressable
              onPress={handleSend}
              disabled={!text.trim() || posting}
              style={[styles.sendBtn, (!text.trim() || posting) && { opacity: 0.4 }]}
            >
              {posting
                ? <ActivityIndicator size="small" color={colors.onAccent} />
                : <Send size={18} color={colors.onAccent} />
              }
            </Pressable>
          </View>
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
  title: { fontSize: 17, fontWeight: '700', color: colors.white },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTxt: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  list: { padding: spacing.screenPad, gap: 16 },
  comment: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bubble: { flex: 1, backgroundColor: colors.surface1, borderRadius: radius.card, padding: 12, borderWidth: 1, borderColor: colors.border },
  commentHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  handle: { fontSize: 13, fontWeight: '700', color: colors.white },
  time: { fontSize: 11.5, color: colors.textFaint },
  body: { fontSize: 14, color: '#D4D4D4', lineHeight: 20 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: spacing.screenPad, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100,
    backgroundColor: colors.surface2, borderRadius: radius.card,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: colors.white,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.jade500,
    alignItems: 'center', justifyContent: 'center',
  },
});
