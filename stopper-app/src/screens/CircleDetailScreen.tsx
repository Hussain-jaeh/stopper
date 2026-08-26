import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft, Users, Smartphone, Cigarette, Brain, Wine, Moon,
  Dumbbell, Heart, Coffee, MessageSquarePlus, MessageCircle, LucideIcon,
} from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { PostCard, Post } from '../components/community/PostCard';
import { PostComposerModal } from '../components/community/PostComposerModal';
import { CommentSheet } from '../components/community/CommentSheet';
import { colors } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';
import { type } from '../constants/typography';
import { RootStackParamList } from '../navigation/TabNavigator';

type Route = RouteProp<RootStackParamList, 'CircleDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const CIRCLE_ICONS: Record<string, LucideIcon> = {
  digital: Smartphone, vaping: Cigarette, mindful: Brain, alcohol: Wine,
  night: Moon, fitness: Dumbbell, health: Heart, caffeine: Coffee,
};

function tintBg(hex: string, a = 0.15) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

export function CircleDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { circleId, name, tint, iconKey } = params;

  const [composerOpen, setComposerOpen] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const circle = useQuery(api.community.getCircle, { circleId: circleId as any });
  const posts = useQuery(api.community.getCirclePosts, { circleId: circleId as any }) as Post[] | undefined;
  const me = useQuery(api.community.getMe);

  const toggleJoin = useMutation(api.community.toggleJoin);
  const cheer = useMutation(api.community.cheer);
  const createPost = useMutation(api.community.createPost);
  const reportPost = useMutation(api.community.reportPost);
  const blockUser = useMutation(api.community.blockUser);

  const Icon = CIRCLE_ICONS[iconKey] ?? Smartphone;

  const handlePost = async (body: string, _circleId?: string, mediaStorageId?: string, mediaType?: 'image' | 'video', thumbStorageId?: string) => {
    await createPost({ type: 'post', body, circleId: circleId as any, mediaStorageId: mediaStorageId as any, mediaType, thumbStorageId: thumbStorageId as any });
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={22} color={colors.white} />
          </Pressable>
          <View style={[styles.circleIcon, { backgroundColor: tintBg(tint) }]}>
            <Icon size={26} color={tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.circleName}>{name}</Text>
            {circle?.description ? (
              <Text style={styles.circleDesc} numberOfLines={2}>{circle.description}</Text>
            ) : null}
            <View style={styles.metaRow}>
              <Users size={13} color={colors.textMuted} />
              <Text style={styles.metaTxt}>
                {circle === undefined ? '…' : (circle?.members ?? 0).toLocaleString()} members
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => circle && toggleJoin({ circleId: circleId as any })}
            style={[styles.joinBtn, circle?.joined ? styles.joinBtnJoined : { backgroundColor: tint }]}
            disabled={circle === undefined}
          >
            <Text style={[styles.joinTxt, { color: circle?.joined ? tint : colors.onAccent }]}>
              {circle?.joined ? 'Joined' : 'Join'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => setComposerOpen(true)} style={[styles.actionBtn, { borderColor: tint + '55', flex: 1 }]}>
            <MessageSquarePlus size={18} color={tint} />
            <Text style={[styles.actionBtnTxt, { color: tint }]}>Post</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('CircleChat', { circleId, name, tint })}
            style={[styles.actionBtn, { borderColor: tint + '55', flex: 1 }]}
          >
            <MessageCircle size={18} color={tint} />
            <Text style={[styles.actionBtnTxt, { color: tint }]}>Chat</Text>
          </Pressable>
        </View>

        <View style={[styles.feed, { paddingHorizontal: spacing.screenPad }]}>
          {posts === undefined ? (
            <ActivityIndicator color={colors.jade400} style={{ marginTop: 40 }} />
          ) : posts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySub}>Be the first to share something here.</Text>
            </View>
          ) : (
            posts.map((p, i) => (
              <PostCard
                key={p.id}
                post={p}
                index={i}
                onCheer={(id) => cheer({ postId: id as any })}
                onOpen={(id) => setCommentPostId(id)}
                onPlayVideo={(url) => navigation.navigate('VaultPlay', { uri: url, title: 'Win' })}
                onReport={(id) => reportPost({ postId: id as any })}
                onBlock={(authorId) => blockUser({ userId: authorId as any })}
              />
            ))
          )}
        </View>
      </ScrollView>

      <PostComposerModal
        visible={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handlePost}
        myHandle={me?.handle ?? ''}
        circles={[]}
        initialCircleId={circleId}
        initialCircleName={name}
      />
      <CommentSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.screenPad,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  circleIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  circleName: { ...type.h1, fontSize: 18, color: colors.white },
  circleDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaTxt: { fontSize: 12.5, color: colors.textMuted },
  joinBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: 'transparent',
  },
  joinBtnJoined: { backgroundColor: 'transparent', borderColor: colors.jade500 },
  joinTxt: { fontSize: 13.5, fontWeight: '700' },
  actions: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: spacing.screenPad, marginTop: 16,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: radius.card,
    backgroundColor: colors.surface1, borderWidth: 1,
  },
  actionBtnTxt: { fontSize: 14.5, fontWeight: '700' },
  feed: { marginTop: 16, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  emptyTitle: { ...type.body, fontWeight: '700', color: colors.white },
  emptySub: { fontSize: 13.5, color: colors.textMuted, marginTop: 6 },
});
