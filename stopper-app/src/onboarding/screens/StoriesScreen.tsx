import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CircleBack, PrimaryButton, DotTexture } from '../../components/primitives';
import { colors, fonts } from '../../theme/tokens';

interface StoriesScreenProps {
  onBack: () => void;
  onNext: () => void;
}

// What the first three months commonly feel like. Framed as general
// expectations, not as quotes from users: Stopper has no verified
// testimonials yet, and invented ones are a review risk and misleading.
// Replace with real, permissioned user stories once there are some.
const STAGES = [
  {
    when: 'Week 1',
    tint: '#FF8A6B',
    title: 'The hardest part',
    body: 'Cravings are loud and come often. Getting through each one is the whole job, and the SOS button is there for exactly that.',
  },
  {
    when: 'Month 1',
    tint: '#F2B23E',
    title: 'The noise starts to drop',
    body: 'Urges usually come less often and pass faster. Many people notice sleep and focus starting to return.',
  },
  {
    when: 'Day 90',
    tint: '#14B888',
    title: 'A new normal',
    body: "The habit stops running your day. A slip doesn't erase this; your progress is still yours.",
  },
];

export function StoriesScreen({ onBack, onNext }: StoriesScreenProps) {
  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={styles.topBar}>
        <CircleBack onBack={onBack} />
        <Text style={styles.topTitle}>What to expect</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {STAGES.map((s, i) => (
          <View key={s.when} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: s.tint }]} />
              {i < STAGES.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.card}>
              <Text style={[styles.when, { color: s.tint }]}>{s.when}</Text>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.note}>Everyone's timeline is different.</Text>
      </ScrollView>
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext}>Continue</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.displayBold, fontSize: 22, color: colors.white },
  list: { flex: 1, zIndex: 1 },
  listContent: { paddingTop: 20, paddingBottom: 8 },
  row: { flexDirection: 'row', gap: 14 },
  rail: { width: 14, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 18 },
  line: { flex: 1, width: 2, backgroundColor: 'rgba(255,255,255,0.10)', marginTop: 6, marginBottom: -12 },
  card: { flex: 1, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, marginBottom: 16, gap: 4 },
  when: { fontFamily: fonts.uiSemibold, fontSize: 13 },
  cardTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.white },
  body: { fontFamily: fonts.ui, fontSize: 14.5, lineHeight: 21, color: colors.fgMuted },
  note: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.fgMuted, textAlign: 'center', marginTop: 4 },
  cta: { paddingTop: 10 },
});
