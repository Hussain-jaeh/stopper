import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HeartHandshake, MessageCircle } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

export type Post = {
  id: string;
  type: 'post' | 'milestone';
  handle: string;
  streak: number;
  circle: string;
  time: string;
  body: string;
  milestone?: string;
  cheers: number;
  replies: number;
  cheered: boolean;
};

export function PostCard({ post, index, onCheer, onOpen }: {
  post: Post; index: number; onCheer: (id: string) => void; onOpen?: (id: string) => void;
}) {
  const milestone = post.type === 'milestone';
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(500)}>
      <View style={[styles.card, milestone && styles.milestoneCard]}>
        <Pressable style={styles.head} onPress={() => onOpen?.(post.id)}>
          <Avatar handle={post.handle} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.handleRow}>
              <Text style={styles.handle}>{post.handle}</Text>
              <View style={styles.streakChip}>
                <Text style={styles.streakTxt}>🔥 {post.streak}d</Text>
              </View>
            </View>
            <Text style={styles.meta}>{post.circle} · {post.time}</Text>
          </View>
          {milestone && <Text style={{ fontSize: 22 }}>🎉</Text>}
        </Pressable>

        {milestone && post.milestone && <Text style={styles.milestoneTitle}>{post.milestone}</Text>}
        <Text style={[styles.body, { color: milestone ? colors.white : '#D4D4D4' }]}>{post.body}</Text>

        <View style={styles.actions}>
          <Pressable
            onPress={() => onCheer(post.id)}
            accessibilityRole="button"
            accessibilityLabel={`Cheer. ${post.cheers} cheers${post.cheered ? ', cheered by you' : ''}`}
            style={[styles.action, post.cheered ? styles.actionOn : styles.actionOff]}
          >
            <HeartHandshake size={16} color={post.cheered ? colors.jade300 : colors.textMuted} />
            <Text style={[styles.actionTxt, { color: post.cheered ? colors.jade300 : colors.textMuted }]}>
              {post.cheers}{post.cheered ? ' · You' : ''}
            </Text>
          </Pressable>
          <Pressable onPress={() => onOpen?.(post.id)} accessibilityRole="button" style={[styles.action, styles.actionOff]}>
            <MessageCircle size={16} color={colors.textMuted} />
            <Text style={[styles.actionTxt, { color: colors.textMuted }]}>{post.replies}</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  milestoneCard: { borderColor: 'rgba(20,184,136,0.28)', backgroundColor: 'rgba(20,184,136,0.06)' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  handleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  handle: { fontWeight: '700', fontSize: 15, color: colors.white },
  streakChip: { backgroundColor: 'rgba(255,107,74,0.14)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  streakTxt: { fontSize: 11.5, fontWeight: '700', color: '#FF8A6B' },
  meta: { fontSize: 12.5, color: colors.textFaint, marginTop: 2 },
  milestoneTitle: { ...type.cardTitle, fontSize: 19, color: colors.jade300, marginTop: 14 },
  body: { fontSize: 15, lineHeight: 22, marginTop: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  actionOff: { backgroundColor: colors.surface2, borderColor: colors.border },
  actionOn: { backgroundColor: 'rgba(20,184,136,0.16)', borderColor: colors.jade500 },
  actionTxt: { fontSize: 13.5, fontWeight: '700' },
});
