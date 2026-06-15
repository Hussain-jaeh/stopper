import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from 'convex/react';
import { X } from 'lucide-react-native';
import { api } from '../../../convex/_generated/api';
import { BreatheStep } from '../components/panic/BreatheStep';
import {
  IntroStep, WhyStep, RedirectStep, WinStep, RelapseStep, ResetStep, PanicProfile,
} from '../components/panic/PanicSteps';
import { PanicCta, TextButton } from '../components/panic/PanicChrome';
import { colors } from '../constants/colors';

type Step = 'intro' | 'breathe' | 'why' | 'redirect' | 'outcome' | 'win' | 'relapse' | 'reset';

export function PanicScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [step, setStep] = useState<Step>('intro');

  const p = (useQuery(api.panic.getContext) ?? {
    streak: 0, longest: 0, habit: '', reason: '',
  }) as PanicProfile;
  const logResistedUrge = useMutation(api.panic.logResistedUrge);
  const logRelapse = useMutation(api.panic.logRelapse);

  const close = () => navigation.goBack();

  const onMadeIt = () => { logResistedUrge(); setStep('win'); };
  const onReset = (trigger?: string) => { logRelapse({ trigger }); setStep('reset'); };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {step === 'intro' && <IntroStep onStart={() => setStep('breathe')} onClose={close} />}
      {step === 'breathe' && <BreatheStep onDone={() => setStep('why')} onSkip={() => setStep('why')} />}
      {step === 'why' && <WhyStep p={p} onNext={() => setStep('redirect')} onClose={close} />}
      {step === 'redirect' && <RedirectStep onMadeIt={() => setStep('outcome')} onClose={close} />}
      {step === 'outcome' && <OutcomeFork onWin={onMadeIt} onSlip={() => setStep('relapse')} onClose={close} />}
      {step === 'win' && <WinStep p={p} onClose={close} />}
      {step === 'relapse' && <RelapseStep onReset={onReset} onClose={close} />}
      {step === 'reset' && <ResetStep onClose={close} />}
    </View>
  );
}

function OutcomeFork({ onWin, onSlip, onClose }: { onWin: () => void; onSlip: () => void; onClose: () => void }) {
  return (
    <View style={styles.col}>
      <View style={styles.topClose}>
        <Pressable onPress={onClose} accessibilityLabel="Close" style={styles.closeBtn}>
          <X size={22} color={colors.textMuted} />
        </Pressable>
      </View>
      <View style={styles.center}>
        <Text style={styles.h1}>How did it go?</Text>
        <Text style={styles.body}>Be honest with yourself — both answers move you forward.</Text>
      </View>
      <View style={{ gap: 12 }}>
        <PanicCta onClick={onWin}>I made it through</PanicCta>
        <TextButton onPress={onSlip}>I slipped this time</TextButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  col: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 22 },
  topClose: { flexDirection: 'row', justifyContent: 'flex-end' },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 29, color: colors.white, textAlign: 'center' },
  body: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 23, marginTop: 16, marginHorizontal: 8 },
});
