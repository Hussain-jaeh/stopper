import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Smartphone, Cigarette, Brain, Wine, Moon, Dumbbell, Heart, Coffee, Plus } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { CommunityHeader, CommunityTab } from '../components/community/CommunityHeader';
import { Composer } from '../components/community/Composer';
import { PostCard, Post } from '../components/community/PostCard';
import { CirclesList, Circle } from '../components/community/CirclesList';
import { Leaderboard, Leader } from '../components/community/Leaderboard';
import { PostComposerModal } from '../components/community/PostComposerModal';
import { CreateCircleModal } from '../components/community/CreateCircleModal';
import { DashboardSkeleton } from '../components/dashboard/states';
import { colors } from '../constants/colors';
import { spacing, radius } from '../constants/spacing';
import { RootStackParamList } from '../navigation/TabNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CIRCLE_ICONS = {
  digital: Smartphone, vaping: Cigarette, mindful: Brain, alcohol: Wine,
  night: Moon, fitness: Dumbbell, health: Heart, caffeine: Coffee,
} as const;

type FeedMode = 'all' | 'mine';

export function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<CommunityTab>('Feed');
  const [feedMode, setFeedMode] = useState<FeedMode>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [createCircleOpen, setCreateCircleOpen] = useState(false);

  const me         = useQuery(api.community.getMe);
  const feed       = useQuery(api.community.getFeed, { mode: feedMode }) as Post[] | undefined;
  const circlesRaw = useQuery(api.community.getCircles);
  const leaders    = useQuery(api.community.getLeaders) as Leader[] | undefined;

  const cheer         = useMutation(api.community.cheer);
  const toggleJoin    = useMutation(api.community.toggleJoin);
  const seedCircles   = useMutation(api.community.seedCircles);
  const createPost    = useMutation(api.community.createPost);
  const createCircle  = useMutation(api.community.createCircle);

  useEffect(() => { seedCircles({}); }, []);

  const circles: Circle[] | undefined = circlesRaw?.map((c: any) => ({
    ...c,
    icon: CIRCLE_ICONS[c.iconKey as keyof typeof CIRCLE_ICONS] ?? Smartphone,
  }));

  const loading = me === undefined || feed === undefined;

  const handlePost = async (body: string, circleId?: string, mediaStorageId?: string, mediaType?: 'image' | 'video', thumbStorageId?: string) => {
    await createPost({ type: 'post', body, circleId: circleId as any, mediaStorageId: mediaStorageId as any, mediaType, thumbStorageId: thumbStorageId as any });
  };

  const handleCreateCircle = async (name: string, iconKey: string, tint: string, description?: string) => {
    const circleId = await createCircle({ name, iconKey, tint, description });
    navigation.navigate('CircleDetail', { circleId: circleId as string, name, tint, iconKey });
  };

  const handleOpenCircle = (c: Circle) => {
    navigation.navigate('CircleDetail', { circleId: c.id, name: c.name, tint: c.tint, iconKey: c.iconKey });
  };

  const hasJoinedCircles = circlesRaw?.some((c: any) => c.joined) ?? false;

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.md }}>
          <CommunityHeader tab={tab} setTab={setTab} onlineCount={12402} index={0} />

          {loading ? (
            <DashboardSkeleton />
          ) : tab === 'Feed' ? (
            <>
              {/* Feed filter: All / My Circles */}
              {hasJoinedCircles && (
                <View style={styles.filterRow}>
                  {(['all', 'mine'] as FeedMode[]).map((m) => {
                    const on = feedMode === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setFeedMode(m)}
                        style={[styles.filterBtn, on && styles.filterBtnOn]}
                      >
                        <Text style={[styles.filterTxt, { color: on ? colors.jade300 : colors.textMuted }]}>
                          {m === 'all' ? 'All posts' : 'My circles'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Composer myHandle={me!.handle} onPress={() => setComposerOpen(true)} index={1} />
              {feed!.length === 0 ? (
                <View style={styles.emptyFeed}>
                  <Text style={styles.emptyTitle}>No posts yet in your circles</Text>
                  <Text style={styles.emptySub}>Be the first — tap Write above to share something.</Text>
                </View>
              ) : (
                feed!.map((p, i) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    index={i + 2}
                    onCheer={(id) => cheer({ postId: id as any })}
                    onOpen={() => {}}
                    onPlayVideo={(url) => navigation.navigate('VaultPlay', { uri: url, title: 'Win' })}
                  />
                ))
              )}
            </>
          ) : tab === 'Circles' ? (
            <>
              <Pressable onPress={() => setCreateCircleOpen(true)} style={styles.createBtn}>
                <Plus size={17} color={colors.jade400} />
                <Text style={styles.createBtnTxt}>Create a circle</Text>
              </Pressable>
              <CirclesList
                circles={circles ?? []}
                onJoin={(id) => {
                  const circle = circles?.find((c) => c.id === id);
                  toggleJoin({ circleId: id as any });
                  // Navigate into the circle when joining (not when leaving)
                  if (circle && !circle.joined) {
                    navigation.navigate('CircleDetail', {
                      circleId: circle.id,
                      name: circle.name,
                      tint: circle.tint,
                      iconKey: circle.iconKey,
                    });
                  }
                }}
                onOpen={handleOpenCircle}
              />
            </>
          ) : (
            <Leaderboard leaders={leaders ?? []} />
          )}
        </View>
      </ScrollView>

      <PostComposerModal
        visible={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handlePost}
        myHandle={me?.handle ?? ''}
        circles={circlesRaw?.map((c: any) => ({ id: c.id, name: c.name, iconKey: c.iconKey, tint: c.tint })) ?? []}
      />

      <CreateCircleModal
        visible={createCircleOpen}
        onClose={() => setCreateCircleOpen(false)}
        onSubmit={handleCreateCircle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.screenPad },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    padding: 4,
  },
  filterBtn: {
    flex: 1, paddingVertical: 8, borderRadius: radius.pill,
    alignItems: 'center',
  },
  filterBtnOn: { backgroundColor: 'rgba(20,184,136,0.14)' },
  filterTxt: { fontSize: 13.5, fontWeight: '700' },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: radius.card,
    backgroundColor: 'rgba(20,184,136,0.08)',
    borderWidth: 1, borderColor: 'rgba(20,184,136,0.28)',
  },
  createBtnTxt: { fontSize: 14.5, fontWeight: '700', color: colors.jade400 },
  emptyFeed: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.white },
  emptySub: { fontSize: 13.5, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
});
