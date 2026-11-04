import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Lightbulb, LucideIcon } from 'lucide-react-native';
import { RollingNumber } from './RollingNumber';
import { Mascot } from '../stickers/Mascot';

// Mascot poses for the stat cards, one per metric.
const MASCOT = {
  streakFlame:  require('../../../assets/mascot/current.png'),
  bestStreak:   require('../../../assets/mascot/best.png'),
  successRate:  require('../../../assets/mascot/success.png'),
  cravingAvg:   require('../../../assets/mascot/craving.png'),
  checkIn:      require('../../../assets/mascot/checkins.png'),
  relapseCount: require('../../../assets/mascot/relapses.png'),
};
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';

export type Range = 'Week' | 'Month' | 'Year';

export function ProgressHeader({ range, setRange, index = 0 }: { range: Range; setRange: (r: Range) => void; index?: number }) {
  const ranges: Range[] = ['Week', 'Month', 'Year'];
  return (
    <Animated.View>
      <Text style={styles.h1}>Your progress</Text>
      <Text style={styles.sub}>Every clean day is a win worth seeing.</Text>
      <View style={styles.segment} accessibilityRole="tablist">
        {ranges.map(r => {
          const on = r === range;
          return (
            <Pressable key={r} onPress={() => setRange(r)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={styles.segItem}>
              {on ? <View style={[StyleSheet.absoluteFill, styles.segOn]} /> : null}
              <Text style={[styles.segTxt, { color: on ? colors.onAccent : colors.textMuted }]}>{r}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

/**
 * Stat cards, composed as one picture rather than six equal boxes:
 *  - one hero (current streak): the only big number, on the raised surface
 *  - a pair (best, success): medium numbers
 *  - a ruled strip (craving, check-ins, relapses): small numbers between rules
 * Each card has one picture (its mascot pose) and one small motion: the
 * number rolls into place, cards staggered 90ms apart.
 */
export function SummaryStrip({
  cleanDays, bestStreak, successRate, cravingAverage, totalCheckIns, totalRelapses, index = 2,
}: {
  cleanDays: number;
  bestStreak: number;
  successRate: number;
  // Optional on purpose: ProgressData is hand-written, so TypeScript cannot
  // check it against what getProgress actually returns. A missing field shows a dash.
  cravingAverage?: number;
  totalCheckIns?: number;
  totalRelapses?: number;
  index?: number;
}) {
  const num = (n?: number) => (typeof n === 'number' && Number.isFinite(n) ? n : null);
  const avg = num(cravingAverage);
  const checkIns = num(totalCheckIns);
  const relapses = num(totalRelapses);
  const days = (n: number) => (n === 1 ? 'day' : 'days');

  // One line of real information the other cards don't already say.
  const heroLine =
    cleanDays === 0 ? 'Day one starts now.'
    : cleanDays >= bestStreak ? 'Your longest streak yet.'
    : `${bestStreak - cleanDays} ${days(bestStreak - cleanDays)} to beat your best.`;

  return (
    <View style={styles.stack}>
      {/* Hero */}
      <View style={[styles.card, styles.hero]}>
        <Mascot source={MASCOT.streakFlame} style={styles.heroMascot} />
        <Text style={styles.label}>Current streak</Text>
        <View style={styles.valueRow}>
          <RollingNumber value={`${cleanDays}`} style={styles.heroVal} />
          <Text style={styles.heroUnit}>{days(cleanDays)}</Text>
        </View>
        <Text style={styles.heroLine}>{heroLine}</Text>
      </View>

      {/* Pair */}
      <View style={styles.pair}>
        <PairCard delay={90} cheer mascot={MASCOT.bestStreak} label="Best streak" value={`${bestStreak}`} unit={days(bestStreak)} />
        <PairCard delay={180} mascot={MASCOT.successRate} label="Success rate" value={`${successRate}`} unit="%" tight />
      </View>

      {/* Ruled strip */}
      <View style={[styles.card, styles.ruled]}>
        <Cell delay={270} mascot={MASCOT.cravingAvg} label="Avg. craving" value={avg === null ? '—' : avg.toFixed(1)} />
        <View style={styles.rule} />
        <Cell delay={360} mascot={MASCOT.checkIn} label="Check-ins" value={checkIns === null ? '—' : `${checkIns}`} />
        <View style={styles.rule} />
        <Cell delay={450} mascot={MASCOT.relapseCount} label="Relapses" value={relapses === null ? '—' : `${relapses}`} />
      </View>
    </View>
  );
}

function PairCard({ mascot, label, value, unit, tight, delay, cheer }: { cheer?: boolean; delay: number; mascot: any; label: string; value: string; unit: string; tight?: boolean }) {
  return (
    <View style={[styles.card, styles.pairCard]}>
      <Mascot source={mascot} style={styles.pairMascot} mood={cheer ? 'cheer' : 'idle'} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <RollingNumber value={value} style={styles.pairVal} startDelay={delay} />
        <Text style={[styles.pairUnit, tight && { marginLeft: 1 }]}>{unit}</Text>
      </View>
    </View>
  );
}

function Cell({ mascot, label, value, delay }: { delay: number; mascot: any; label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Mascot source={mascot} style={styles.cellMascot} />
      {value === '—'
        ? <Text style={styles.cellVal}>—</Text>
        : <RollingNumber value={value} style={styles.cellVal} startDelay={delay} />}
      <Text style={styles.cellLbl}>{label}</Text>
    </View>
  );
}

export function InsightCard({ title, body, index = 6 }: { title: string; body: string; index?: number }) {
  return (
    <Animated.View>
      <LinearGradient colors={['rgba(20,184,136,0.10)', 'rgba(46,125,209,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.insight}>
        <Lightbulb size={22} color={colors.jade300} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.insightTitle}>{title}</Text>
          <Text style={styles.insightBody}>{body}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  h1: { ...type.h1, color: colors.white },
  sub: { ...type.label, color: colors.textMuted, marginTop: 6 },
  segment: { flexDirection: 'row', gap: 5, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 4, marginTop: 18 },
  segItem: { flex: 1, height: 38, borderRadius: 11, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.jade500, borderRadius: 11 },
  segTxt: { fontSize: 13, fontWeight: '700' },
  stack: { gap: 12 },
  // On dark, depth comes from a lighter surface, not a shadow.
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden' },
  label: { fontSize: 13, color: colors.textMuted, fontFamily: 'PlusJakartaSans_600SemiBold' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },

  hero: { backgroundColor: colors.surface3, padding: 18, paddingRight: 140, minHeight: 150, justifyContent: 'center' },
  heroMascot: { position: 'absolute', right: -6, bottom: -14, width: 150, height: 150 },
  heroVal: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 56, letterSpacing: -1.5, color: colors.white },
  heroUnit: { fontSize: 18, color: colors.textMuted, fontFamily: 'PlusJakartaSans_600SemiBold', marginLeft: 6, marginBottom: 12 },
  heroLine: { fontSize: 14, color: colors.white, opacity: 0.85, marginTop: 2, fontFamily: 'PlusJakartaSans_400Regular' },

  pair: { flexDirection: 'row', gap: 12 },
  pairCard: { flex: 1, padding: 14, paddingRight: 64, minHeight: 104, justifyContent: 'flex-end' },
  pairMascot: { position: 'absolute', right: -8, bottom: -8, width: 84, height: 84 },
  pairVal: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 30, letterSpacing: -0.6, color: colors.white },
  pairUnit: { fontSize: 13, color: colors.textMuted, fontFamily: 'PlusJakartaSans_600SemiBold', marginLeft: 4, marginBottom: 6 },

  ruled: { flexDirection: 'row', paddingVertical: 14 },
  rule: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.10)', marginVertical: 4 },
  cell: { flex: 1, alignItems: 'center', gap: 2 },
  cellMascot: { width: 44, height: 44, marginBottom: 4 },
  cellVal: { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 20, color: colors.white },
  cellLbl: { fontSize: 12, color: colors.textMuted, fontFamily: 'PlusJakartaSans_400Regular' },
  insight: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', padding: 18, borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(20,184,136,0.22)' },
  insightTitle: { ...type.body, fontWeight: '700', color: colors.white, marginBottom: 4 },
  insightBody: { fontSize: 13.5, color: colors.textMuted, lineHeight: 19 },
});
