import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown, useSharedValue, withTiming, Easing,
} from 'react-native-reanimated';
import { PiggyBank } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { type } from '../../constants/typography';
import { SpendingSettings, savedBuckets, fmtMoney } from '../../lib/money';

function CountUp({ value, currency, style }: { value: number; currency: string; style?: object }) {
  const v = useSharedValue(0);
  const [display, setDisplay] = React.useState('');
  useEffect(() => {
    v.value = 0;
    v.value = withTiming(value, { duration: 900, easing: Easing.out(Easing.cubic) });
    const id = setInterval(() => setDisplay(fmtMoney(v.value, currency)), 32);
    const stop = setTimeout(() => { clearInterval(id); setDisplay(fmtMoney(value, currency)); }, 950);
    return () => { clearInterval(id); clearTimeout(stop); };
  }, [value, currency]);
  return <Text style={style}>{display || fmtMoney(value, currency)}</Text>;
}

export function MoneySavedCard({
  settings, daysSinceQuit, onViewInsights, index = 3,
}: { settings: SpendingSettings; daysSinceQuit: number; onViewInsights: () => void; index?: number }) {
  if (!settings.trackingEnabled) return null;
  const b = savedBuckets(settings, daysSinceQuit);
  const cells: [string, number][] = [['Today', b.today], ['This week', b.week], ['This month', b.month]];

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(550)} style={styles.card}>
      <View style={styles.head}>
        <View style={styles.title}><PiggyBank size={18} color={colors.jade400} /><Text style={styles.titleTxt}>Money saved</Text></View>
        <Pressable onPress={onViewInsights}><Text style={styles.link}>Insights ›</Text></Pressable>
      </View>
      <CountUp value={b.total} currency={settings.currency} style={styles.total} />
      <Text style={styles.caption}>kept since day one · {daysSinceQuit} days free</Text>
      <View style={styles.row}>
        {cells.map(([label, val]) => (
          <View key={label} style={styles.cell}>
            <Text style={styles.cellVal}>{fmtMoney(val, settings.currency)}</Text>
            <Text style={styles.cellLbl}>{label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  titleTxt: { fontWeight: '700', fontSize: 15.5, color: colors.white },
  link: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  total: { ...type.h1, fontSize: 42, color: colors.white, marginTop: 6, marginBottom: 2 },
  caption: { fontSize: 13, color: colors.jade300, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cell: { flex: 1, backgroundColor: colors.surface2, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 10 },
  cellVal: { ...type.h1, fontSize: 16, color: colors.white },
  cellLbl: { fontSize: 11.5, color: colors.textMuted, marginTop: 3 },
});
