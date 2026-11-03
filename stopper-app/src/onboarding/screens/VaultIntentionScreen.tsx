import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Video, Lock, CheckCircle2 } from 'lucide-react-native';
import { CircleBack, PrimaryButton, SkipLink, DotTexture } from '../../components/primitives';
import { OnboardingState, firstName } from '../state';
import { colors, fonts } from '../../theme/tokens';

interface VaultIntentionScreenProps {
  onBack: () => void;
  onNext: () => void;
  state: OnboardingState;
}

/**
 * Free Day 1 / intention message for the Future You Vault, recorded before the
 * paywall. This is the one vault video available without Premium; milestone
 * messages (Day 7, 30, 90…) are what the paywall unlocks.
 */
export function VaultIntentionScreen({ onBack, onNext, state }: VaultIntentionScreenProps) {
  const fn = firstName(state);
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);

  // Lazy so expo-camera only initialises if the user chooses to record.
  let Recorder: React.ComponentType<any> | null = null;
  if (recording) {
    try {
      Recorder = require('../../screens/VaultRecordScreen').VaultRecorder;
    } catch {
      Recorder = null;
    }
  }

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>

      <View style={[styles.content, { zIndex: 1 }]}>
        <View style={styles.icon}>
          {saved ? <CheckCircle2 size={34} color={colors.jade400} /> : <Video size={34} color={colors.jade400} />}
        </View>
        <Text style={styles.eyebrow}>FUTURE YOU VAULT</Text>
        <Text style={styles.title}>
          {saved ? 'Your Day 1 message is saved' : `Record your Day 1 message${fn ? `, ${fn}` : ''}`}
        </Text>
        <Text style={styles.body}>
          {saved
            ? "It's waiting in your vault. On a hard day, you'll hear exactly why you started."
            : "30–60 seconds on why you're quitting. Stopper plays it back to you when cravings hit."}
        </Text>
        <View style={styles.lockRow}>
          <Lock size={14} color={colors.fgMuted} />
          <Text style={styles.lockTxt}>Private to your account. Nobody else can watch it.</Text>
        </View>
      </View>

      <View style={[styles.cta, { zIndex: 1 }]}>
        {saved ? (
          <PrimaryButton onPress={onNext}>Continue</PrimaryButton>
        ) : (
          <>
            <PrimaryButton onPress={() => setRecording(true)}>Record my message</PrimaryButton>
            <SkipLink onPress={onNext}>Skip for now</SkipLink>
          </>
        )}
      </View>

      <Modal visible={recording && !!Recorder} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setRecording(false)}>
        {Recorder && (
          <Recorder
            intention
            onClose={() => setRecording(false)}
            onDone={() => { setRecording(false); setSaved(true); }}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  icon: {
    width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(20,184,136,0.12)', borderWidth: 1.5, borderColor: colors.jade500, marginBottom: 6,
  },
  eyebrow: { fontFamily: fonts.uiSemibold, fontSize: 13, letterSpacing: 2, color: colors.jade300 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.white, letterSpacing: -0.3, textAlign: 'center' },
  body: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, textAlign: 'center', marginHorizontal: 8 },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  lockTxt: { fontFamily: fonts.ui, fontSize: 13, color: colors.fgMuted },
  cta: { paddingTop: 10, gap: 6, alignItems: 'stretch' },
});
