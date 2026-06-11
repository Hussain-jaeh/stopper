import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Smartphone, Cigarette, Brain, Wine, Moon } from 'lucide-react-native';
import { CommunityHeader, CommunityTab } from '../components/community/CommunityHeader';
import { Composer } from '../components/community/Composer';
import { PostCard, Post } from '../components/community/PostCard';
import { CirclesList, Circle } from '../components/community/CirclesList';
import { Leaderboard, Leader } from '../components/community/Leaderboard';
import { PostComposerModal } from '../components/community/PostComposerModal';
import { DashboardSkeleton } from '../components/dashboard/states';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

const CIRCLE_ICONS = {
  digital: Smartphone,
  vaping: Cigarette,
  mindful: Brain,
  alcohol: Wine,
  night: Moon,
} as const;

export function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<CommunityTab>('Feed');
  const [composerOpen, setComposerOpen] = useState(false);

  const me         = useQuery(api.community.getMe);
  const feed       = useQuery(api.community.getFeed) as Post[] | undefined;
  const circlesRaw = useQuery(api.community.getCircles);
  const leaders    = useQuery(api.community.getLeaders) as Leader[] | undefined;

  const cheer       = useMutation(api.community.cheer);
  const toggleJoin  = useMutation(api.community.toggleJoin);
  const seedCircles = useMutation(api.community.seedCircles);
  const createPost  = useMutation(api.community.createPost);

  useEffect(() => { seedCircles({}); }, []);

  const circles: Circle[] | undefined = circlesRaw?.map((c: any) => ({
    ...c,
    icon: CIRCLE_ICONS[c.iconKey as keyof typeof CIRCLE_ICONS] ?? Smartphone,
  }));

  const loading = me === undefined || feed === undefined;

  const handlePost = async (body: string, circleId?: string) => {
    await createPost({ type: 'post', body, circleId: circleId as any });
  };

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
              <Composer myHandle={me!.handle} onPress={() => setComposerOpen(true)} index={1} />
              {feed!.map((p, i) => (
                <PostCard
                  key={p.id}
                  post={p}
                  index={i + 2}
                  onCheer={(id) => cheer({ postId: id as any })}
                  onOpen={() => {}}
                />
              ))}
            </>
          ) : tab === 'Circles' ? (
            <CirclesList
              circles={circles ?? []}
              onJoin={(id) => toggleJoin({ circleId: id as any })}
            />
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
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.screenPad },
});
