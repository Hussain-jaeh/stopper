import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Send, X, Reply, Lock } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { RootStackParamList } from '../navigation/TabNavigator';
import { Avatar } from '../components/community/Avatar';
import { colors } from '../constants/colors';
import { spacing, radius } from '../constants/spacing';
import { type } from '../constants/typography';

type Route = RouteProp<RootStackParamList, 'CircleChat'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

type Message = {
  id: string;
  handle: string;
  isMe: boolean;
  body: string;
  time: string;
  replyTo: { id: string; handle: string; body: string } | null;
};

function tintBg(hex: string, a = 0.15) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

export function CircleChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { circleId, name, tint } = params;

  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [sending, setSending] = useState(false);
  const [cachedMessages, setCachedMessages] = useState<Message[]>([]);
  const listRef = useRef<FlatList>(null);

  const circle = useQuery(api.community.getCircle, { circleId: circleId as any });
  const messages = useQuery(api.chat.getMessages, { circleId: circleId as any }) as Message[] | undefined;
  const sendMessage = useMutation(api.chat.sendMessage);

  useEffect(() => {
    if (messages) {
      setCachedMessages(messages);
      if (messages.length) {
        listRef.current?.scrollToEnd({ animated: true });
      }
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    const pendingReply = replyTo;
    setText('');
    setReplyTo(null);
    try {
      await sendMessage({
        circleId: circleId as any,
        body,
        replyToId: pendingReply?.id as any,
      });
    } finally {
      setSending(false);
    }
  }, [text, replyTo, sending, sendMessage, circleId]);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.white} />
        </Pressable>
        <View style={[styles.tintDot, { backgroundColor: tint }]} />
        <Text style={styles.headerName} numberOfLines={1}>{name} · Chat</Text>
      </View>

      {/* Messages */}
      {messages === undefined && cachedMessages.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.jade400} />
        </View>
      ) : cachedMessages.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySub}>Be the first to say something 👋</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={cachedMessages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} tint={tint} onReply={() => setReplyTo(item)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Reply preview bar */}
      {replyTo && circle?.joined && (
        <View style={styles.replyBar}>
          <View style={[styles.replyAccent, { backgroundColor: tint }]} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.replyHandle, { color: tint }]}>@{replyTo.handle}</Text>
            <Text style={styles.replyPreview} numberOfLines={1}>{replyTo.body}</Text>
          </View>
          <Pressable onPress={() => setReplyTo(null)} style={styles.replyClose}>
            <X size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      {/* Input — only for members */}
      {circle?.joined ? (
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.textFaint}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[styles.sendBtn, { backgroundColor: tint, opacity: text.trim() && !sending ? 1 : 0.35 }]}
          >
            <Send size={17} color="#fff" />
          </Pressable>
        </View>
      ) : circle !== undefined ? (
        <Pressable
          onPress={() => navigation.navigate('CircleDetail', { circleId, name, tint, iconKey: '' })}
          style={[styles.joinGate, { paddingBottom: insets.bottom + 8 }]}
        >
          <Lock size={16} color={colors.textMuted} />
          <Text style={styles.joinGateTxt}>Join <Text style={{ color: tint }}>{name}</Text> to send messages</Text>
        </Pressable>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, tint, onReply }: {
  message: Message; tint: string; onReply: () => void;
}) {
  const { isMe, handle, body, time, replyTo } = message;

  return (
    <View style={styles.msgRow}>
      {/* Avatar on left for others, spacer for me */}
      {!isMe ? <Avatar handle={handle} size={34} /> : <View style={{ flex: 1 }} />}

      <View style={[styles.msgCol, isMe && { alignItems: 'flex-end' }]}>
        {!isMe && <Text style={styles.msgHandle}>{handle}</Text>}
        <Pressable
          onLongPress={onReply}
          style={[styles.bubble, isMe ? { backgroundColor: tint + 'CC' } : styles.bubbleOther]}
        >
          {replyTo && (
            <View style={[styles.replyInBubble, { borderLeftColor: tint }]}>
              <Text style={[styles.replyInHandle, { color: tint }]}>@{replyTo.handle}</Text>
              <Text style={styles.replyInBody} numberOfLines={2}>{replyTo.body}</Text>
            </View>
          )}
          <Text style={styles.bubbleTxt}>{body}</Text>
        </Pressable>
        <View style={[styles.msgMeta, isMe && { flexDirection: 'row-reverse' }]}>
          <Text style={styles.msgTime}>{time}</Text>
          <Pressable onPress={onReply} hitSlop={8} style={styles.replyIconBtn}>
            <Reply size={12} color={colors.textFaint} />
          </Pressable>
        </View>
      </View>

      {/* Avatar on right for me, spacer for others */}
      {isMe ? <Avatar handle={handle} size={34} /> : <View style={{ flex: 1 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.screenPad, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  tintDot: { width: 10, height: 10, borderRadius: 5 },
  headerName: { ...type.body, fontWeight: '700', color: colors.white, flex: 1 },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 6 },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  list: { paddingHorizontal: spacing.screenPad, paddingTop: 16, paddingBottom: 8, gap: 12 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgCol: { maxWidth: '75%', gap: 4 },
  msgHandle: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginLeft: 4 },
  bubble: {
    borderRadius: radius.card, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleOther: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border },
  bubbleTxt: { fontSize: 15, color: colors.white, lineHeight: 21 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  msgTime: { fontSize: 11, color: colors.textFaint },
  replyIconBtn: { padding: 2 },

  replyInBubble: {
    borderLeftWidth: 3, paddingLeft: 8, marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4, padding: 6,
  },
  replyInHandle: { fontSize: 11.5, fontWeight: '700', marginBottom: 2 },
  replyInBody: { fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 17 },

  replyBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.screenPad, paddingVertical: 10,
    backgroundColor: colors.surface1, borderTopWidth: 1, borderTopColor: colors.border,
  },
  replyAccent: { width: 3, height: 36, borderRadius: 2 },
  replyHandle: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  replyPreview: { fontSize: 12.5, color: colors.textMuted },
  replyClose: { padding: 4 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: spacing.screenPad, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1, fontSize: 15, color: colors.white,
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, paddingHorizontal: 14, paddingVertical: 10,
    maxHeight: 100, lineHeight: 21,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  joinGate: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingHorizontal: spacing.screenPad, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  joinGateTxt: { fontSize: 14.5, color: colors.textMuted, fontWeight: '600' },
});
