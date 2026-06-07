import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CircleBack, AlertBanner, CheckboxRow, PrimaryButton } from '../../components/primitives';
import { SYMPTOMS } from '../data';
import { OnboardingState, habitLabel } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface SymptomsScreenProps {
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
  setState: (patch: Partial<OnboardingState>) => void;
}

export function SymptomsScreen({ onBack, onNext, state, setState }: SymptomsScreenProps) {
  const toggle = (id: string) => {
    const next = new Set(state.symptoms);
    next.has(id) ? next.delete(id) : next.add(id);
    setState({ symptoms: next });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <CircleBack onBack={onBack} />
        <Text style={styles.topTitle}>Symptoms</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <AlertBanner>
          Excessive {habitLabel(state)} can quietly take a toll on how you think and feel.
        </AlertBanner>
        <Text style={styles.prompt}>Select any symptoms you've noticed:</Text>
        {Object.entries(SYMPTOMS).map(([cat, items]) => (
          <View key={cat}>
            <Text style={styles.catLabel}>{cat}</Text>
            {items.map(item => (
              <View key={item.id} style={{ marginBottom: 10 }}>
                <CheckboxRow
                  label={item.label}
                  checked={state.symptoms.has(item.id)}
                  onPress={() => toggle(item.id)}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext}>Reboot my brain</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.display, fontWeight: '700', fontSize: 22, color: colors.white },
  list: { flex: 1, marginTop: 16 },
  listContent: { gap: 14, paddingBottom: 8 },
  prompt: { fontFamily: fonts.ui, fontSize: 18, color: colors.white, marginTop: 4 },
  catLabel: { fontFamily: fonts.ui, fontWeight: '700', fontSize: 15, color: colors.white, marginBottom: 10 },
  cta: { paddingTop: 12 },
});
