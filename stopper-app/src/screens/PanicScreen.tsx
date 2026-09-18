import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation } from 'convex/react';
import { X } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { BreatheStep } from '../components/panic/BreatheStep';
import { RedirectStep } from './breakloop/RedirectStep';
import { BreakTheLoopSession } from './breakloop/BreakTheLoopSession';
import { BreakTheLoopComplete } from './breakloop/BreakTheLoopComplete';
import { STEER_AFTER_SESSIONS } from '../lib/breakTheLoop';
import {
  IntroStep, WhyStep, WinStep, RelapseStep, ResetStep, PanicProfile,
} from '../components/panic/PanicSteps';
import { PanicCta, TextButton } from '../components/panic/PanicChrome';
import { CravingVaultPrompt } from '../components/vault/VaultPrompts';
import { syncMilestoneNotifications } from '../notifications/reminders';
import { colors } from '../constants/colors';
import { RootStackParamList } from '../navigation/TabNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Step = 'vault' | 'intro' | 'breathe' | 'why' | 'redirect' | 'loop' | 'loopDone' | 'outcome' | 'win' | 'relapse' | 'reset';

export function PanicScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState<Step>('vault');
  /**
   * Sessions in THIS craving episode, not lifetime. The screen is a
   * fullScreenModal, so mounting is the episode — it resets on its own.
   * Never persisted and never displayed: a visible count is a score, which is
   * the one thing this feature must not grow.
   */
  const [loopSessions, setLoopSessions] = useState(0);

  const p = (useQuery(api.panic.getContext) ?? {
    streak: 0, longest: 0, habit: '', reason: '',
  }) as PanicProfile;
  const latest = useQuery(api.vault.latestRecording);
  const logResistedUrge = useMutation(api.panic.logResistedUrge);
  const logRelapse = useMutation(api.panic.logRelapse);

  useEffect(() => {
    if (latest === null && step === 'vault') setStep('intro');
  }, [latest, step]);

  const close = () => navigation.goBack();

  const onMadeIt = () => { logResistedUrge(); setStep('win'); };
  const onReset = (trigger?: string) => {
    logRelapse({ trigger });
    // The streak is now 0; schedule from there rather than from the clock.
    syncMilestoneNotifications(0).catch(() => {});
    setStep('reset');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {step === 'vault' && latest && (
        <CravingVaultPrompt
          latest={latest as any}
          onWatch={() => {
            setStep('intro');
            navigation.navigate('VaultPlay', { recordingId: latest.id, title: latest.title, day: latest.day });
          }}
          onSkip={() => setStep('intro')}
        />
      )}
      {step === 'intro' && <IntroStep onStart={() => setStep('breathe')} onClose={close} />}
      {step === 'breathe' && <BreatheStep onDone={() => setStep('why')} onSkip={() => setStep('why')} />}
      {step === 'why' && <WhyStep p={p} onNext={() => setStep('redirect')} onClose={close} />}
      {step === 'redirect' && (
        <RedirectStep
          onStart={() => setStep('loop')}
          onBack={() => setStep('why')}
          // Picking a redirect means they're going to go and do it — the
          // question left is how it went.
          onPick={() => setStep('outcome')}
        />
      )}
      {step === 'loop' && (
        <BreakTheLoopSession
          onDone={() => { setLoopSessions(n => n + 1); setStep('loopDone'); }}
          onExit={() => setStep('outcome')}
        />
      )}
      {step === 'loopDone' && (
        <BreakTheLoopComplete
          variant={loopSessions >= STEER_AFTER_SESSIONS ? 'third' : 'first'}
          onAgain={() => setStep('loop')}
          onDone={() =>
            setStep(loopSessions >= STEER_AFTER_SESSIONS ? 'redirect' : 'outcome')
          }
        />
      )}
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
