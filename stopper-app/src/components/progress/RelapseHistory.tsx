import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RotateCcw, PartyPopper } from 'lucide-react-native';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

const TRIGGER_LABELS: Record<string, string> = {
  stress:      '😔 Stress',
  boredom:     '😴 Boredom',
  social:      '👥 Social',
  emotions:    '💔 Emotions',
  environment: '🏠 Environment',
  other:       '💭 Other',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RelapseHistory({ index = 7 }: { index?: number }) {
  const result = useQuery(api.relapses.getRelapses, {
    paginationOpts: { numItems: 20, cursor: null },
  });

  // Still loading
  if (result === undefined) return null;

  const relapses = result?.page ?? [];

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)}>
      <Text style={styles.sectionLabel}>RELAPSE HISTORY</Text>

      {relapses.length === 0 ? (
        <View style={styles.emptyCard}>
          <PartyPopper size={28} color={colors.jade400} />
          <Text style={styles.emptyTitle}>No relapses logged</Text>
          <Text style={styles.emptySub}>Keep it up — every clean day counts.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {relapses.map((r, i) => (
            <View key={r._id as string} style={[styles.card, i < relapses.length - 1 && styles.cardBorder]}>
              <View style={styles.iconWrap}>
                <RotateCcw size={16} color={colors.coral400} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={styles.row}>
                  <Text style={styles.trigger}>
                    {TRIGGER_LABELS[r.trigger] ?? r.trigger}
                  </Text>
                  <Text style={styles.date}>{formatDate(r.createdAt)}</Text>
                </View>
                {r.note ? <Text style={styles.note}>{r.note}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.textFaint,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  emptyCard: {
    backgroundColor: 'rgba(20,184,136,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(20,184,136,0.28)',
    borderRadius: radius.card,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { ...type.body, fontWeight: '700', color: colors.white },
  emptySub: { fontSize: 13.5, color: colors.textMuted, textAlign: 'center' },
  list: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,74,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  trigger: { fontSize: 14.5, fontWeight: '600', color: colors.white, flex: 1 },
  date: { fontSize: 12.5, color: colors.textFaint },
  note: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
