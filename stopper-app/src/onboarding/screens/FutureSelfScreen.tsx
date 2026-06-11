import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MinusCircle, CheckCircle2 } from 'lucide-react-native';
import { CircleBack, PrimaryButton, DotTexture } from '../../components/primitives';
import { OnboardingState, firstName } from '../state';
import { colors, fonts } from '../../theme/tokens';

const TODAY_ITEMS = ['Foggy & tired', 'Low motivation', 'On autopilot'];
const FUTURE_ITEMS = ['Clear & sharp', 'Driven daily', 'In control'];

interface FutureSelfScreenProps {
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
}

export function FutureSelfScreen({ onBack, onNext, state }: FutureSelfScreenProps) {
  const fn = firstName(state);

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>
      <View style={[styles.content, { zIndex: 1 }]}>
        <View style={styles.eyebrowBlock}>
          <Text style={styles.eyebrow}>90 DAYS FROM NOW</Text>
          <Text style={styles.title}>Meet your future self{fn ? `, ${fn}` : ''}</Text>
        </View>

        <View style={styles.columns}>
          {/* Today */}
          <View style={styles.col}>
            <Text style={styles.colLabel}>TODAY</Text>
            {TODAY_ITEMS.map(t => (
              <View key={t} style={styles.colItem}>
                <MinusCircle size={16} color={colors.gray600} />
                <Text style={styles.colItemText}>{t}</Text>
              </View>
            ))}
          </View>
          {/* Future */}
          <View style={[styles.col, styles.colFuture]}>
            <Text style={[styles.colLabel, styles.colLabelFuture]}>FUTURE YOU</Text>
            {FUTURE_ITEMS.map(t => (
              <View key={t} style={styles.colItem}>
                <CheckCircle2 size={16} color={colors.jade400} />
                <Text style={[styles.colItemText, { color: colors.white, fontWeight: '500' }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          This isn't a fantasy. It's the version of you on the other side of this habit.
        </Text>
      </View>

      <View style={[styles.cta, { zIndex: 1 }]}>
        <PrimaryButton onPress={onNext}>I want this</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  content: { flex: 1, justifyContent: 'center', gap: 18 },
  eyebrowBlock: { alignItems: 'center' },
  eyebrow: { fontFamily: fonts.ui, fontSize: 13, fontWeight: '600', letterSpacing: 2, color: colors.jade300, textTransform: 'uppercase' },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3, marginTop: 10, textAlign: 'center' },
  columns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  col: { flex: 1, borderRadius: 18, padding: 16, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border },
  colFuture: { backgroundColor: 'rgba(20,184,136,0.10)', borderWidth: 1.5, borderColor: colors.jade500 },
  colLabel: { fontFamily: fonts.ui, fontSize: 12, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.fgMuted, marginBottom: 12 },
  colLabelFuture: { color: colors.jade300 },
  colItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 9 },
  colItemText: { fontFamily: fonts.ui, fontSize: 14, color: colors.fgMuted },
  footer: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, textAlign: 'center', marginHorizontal: 8, marginTop: 6 },
  cta: { paddingTop: 10 },
});
