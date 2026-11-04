// BULLETPROOF 7-COLUMN MONTH HEATMAP.
//
// Sizing each cell at width:"14.28%" lets RN's % rounding push 7 cells to
// 8-per-row or overflow with touching squares. Fix: measure the grid's pixel
// width once via onLayout → cell = Math.floor((width - GAP*6) / 7) → integer,
// exact 7 columns on every device. Do NOT convert back to percentage widths.
import { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';
import { fonts } from '../../theme/tokens';

export type CalendarData = {
  monthLabel: string;
  monthStartDow: number; // weekday of the 1st, 0 = Monday … 6 = Sunday
  daysInMonth: number;
  today: number;         // day-of-month (0 if not current month)
  startDay?: number;     // first day that counts (quit day this month, else 1)
  cleanDays: number;     // clean days this month for the header count
  relapses: number[];    // day numbers that were slips
};

const DOWS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const GAP = 6;

export function CalendarHeatmap({ data, index = 3 }: { data: CalendarData; index?: number }) {
  const [cell, setCell] = useState(0);
  const onGridLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setCell(Math.floor((w - GAP * 6) / 7));
  };

  const cells: (number | null)[] = [
    ...Array(data.monthStartDow).fill(null),
    ...Array.from({ length: data.daysInMonth }, (_, i) => i + 1),
  ];

  const isRelapse = (d: number) => data.relapses.includes(d);
  const isToday   = (d: number) => d === data.today;
  const start     = data.startDay ?? 1;
  const isBefore  = (d: number) => d < start;
  const isClean   = (d: number) => data.today > 0 && d >= start && d < data.today && !isRelapse(d);

  const fillFor = (d: number | null) => {
    if (d == null) return 'transparent';
    if (isRelapse(d)) return 'rgba(242,98,46,0.92)';
    if (isClean(d)) return colors.jade500;
    // Upcoming days: no box, just the number — a grid of grey boxes read as noise.
    return 'transparent';
  };
  const textFor = (d: number | null) => {
    if (d == null) return 'transparent';
    if (isRelapse(d) || isToday(d)) return colors.white;
    if (isClean(d)) return colors.onAccent;
    if (isBefore(d)) return colors.textFaint;
    return d < data.today ? colors.textFaint : colors.textMuted;
  };

  return (
    <Animated.View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.month}>{data.monthLabel}</Text>
        <Text style={styles.meta}>
          {data.cleanDays} clean {data.cleanDays === 1 ? 'day' : 'days'} · {data.relapses.length} {data.relapses.length === 1 ? 'slip' : 'slips'}
        </Text>
      </View>

      <View style={styles.weekRow}>
        {DOWS.map((w, i) => (
          <Text key={i} style={[styles.dow, { width: cell || undefined, flex: cell ? undefined : 1 }]}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid} onLayout={onGridLayout}>
        {cell > 0 && cells.map((d, i) => (
          <View key={i} style={{ width: cell, height: cell, alignItems: 'center', justifyContent: 'center' }}>
            {d != null && (
              <View style={[
                styles.square,
                { backgroundColor: fillFor(d) },
                isToday(d) && styles.todayRing,
                // Consecutive clean days in the same week join into one bar,
                // so a streak reads as a run rather than separate boxes.
                isClean(d) && i % 7 !== 0 && d > 1 && isClean(d - 1) && styles.joinLeft,
                isClean(d) && i % 7 !== 6 && d < data.daysInMonth && isClean(d + 1) && styles.joinRight,
              ]}>
                {isClean(d) && i % 7 !== 6 && d < data.daysInMonth && isClean(d + 1) && (
                  <View pointerEvents="none" style={styles.bridge} />
                )}
                <Text style={[styles.dayTxt, (isToday(d) || isClean(d)) && styles.dayTxtStrong, { color: textFor(d) }]}>{d}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <Legend color={colors.jade500} label="Clean" />
        <Legend color="rgba(242,98,46,0.92)" label="Slip" />
        <Legend ring label="Today" />
      </View>
    </Animated.View>
  );
}

function Legend({ color, ring, label }: { color?: string; ring?: boolean; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, ring ? { borderWidth: 2, borderColor: colors.jade400 } : { backgroundColor: color }]} />
      <Text style={styles.legendTxt}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  month: { ...type.cardTitle, color: colors.white },
  meta: { fontSize: 12.5, color: colors.textMuted, fontFamily: fonts.ui },
  weekRow: { flexDirection: 'row', columnGap: GAP, marginBottom: 6 },
  dow: { textAlign: 'center', fontSize: 11, color: colors.textFaint, fontFamily: fonts.uiSemibold, letterSpacing: 0.5 },
  // rowGap/columnGap keep 7 columns exact — do NOT use percentage widths or margins
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: GAP, columnGap: GAP },
  square: { width: '100%', height: '100%', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  joinLeft: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  joinRight: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  bridge: { position: 'absolute', top: 0, bottom: 0, right: -GAP, width: GAP, backgroundColor: colors.jade500 },
  todayRing: { borderWidth: 2, borderColor: colors.jade400, backgroundColor: 'transparent' },
  dayTxt: { fontSize: 14, fontFamily: fonts.ui, fontVariant: ['tabular-nums'] },
  dayTxtStrong: { fontFamily: fonts.uiSemibold },
  legend: { flexDirection: 'row', gap: 16, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 11, height: 11, borderRadius: 4 },
  legendTxt: { fontSize: 12, color: colors.textMuted },
});
