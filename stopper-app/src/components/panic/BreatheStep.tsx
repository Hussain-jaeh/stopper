import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer } from 'expo-audio';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { PanicCta, TextButton } from './PanicChrome';

const SITE_URL = (process.env.EXPO_PUBLIC_CONVEX_URL ?? '').replace('.convex.cloud', '.convex.site');

const PHASES: { label: string; tts: string; duration: number }[] = [
  { label: 'Breathe in',  tts: 'Breathe in... slowly and deeply...',  duration: 4000 },
  { label: 'Hold',        tts: 'Hold it there...',                     duration: 4000 },
  { label: 'Breathe out', tts: 'Now breathe out... let it all go...', duration: 6000 },
];
const TOTAL_CYCLES = 3;

function ttsUrl(text: string) {
  return `${SITE_URL}/api/tts?text=${encodeURIComponent(text)}`;
}

export function BreatheStep({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [done, setDone]   = useState(false);
  const scale = useSharedValue(0.6);

  // Ambient rain loop
  const ambient = useAudioPlayer({ uri: `${SITE_URL}/api/sfx` });

  // Voice players — one per phase so all can be pre-buffered
  const voice0 = useAudioPlayer({ uri: ttsUrl(PHASES[0].tts) });
  const voice1 = useAudioPlayer({ uri: ttsUrl(PHASES[1].tts) });
  const voice2 = useAudioPlayer({ uri: ttsUrl(PHASES[2].tts) });

  const voices = [voice0, voice1, voice2];

  // Start ambient when component mounts
  useEffect(() => {
    ambient.loop = true;
    ambient.volume = 0.3;
    try { ambient.play(); } catch { }

    return () => { try { ambient.pause(); } catch { } };
  }, []);

  // Speak the current phase
  useEffect(() => {
    if (done) return;
    const player = voices[phase];
    player.seekTo(0);
    player.volume = 1.0;
    try { player.play(); } catch { }
  }, [phase, done]);

  // Orb animation + phase timer
  useEffect(() => {
    const dur = PHASES[phase].duration;
    if (phase === 0) scale.value = withTiming(1,   { duration: dur, easing: Easing.inOut(Easing.ease) });
    if (phase === 2) scale.value = withTiming(0.6, { duration: dur, easing: Easing.inOut(Easing.ease) });

    const t = setTimeout(() => {
      if (phase === PHASES.length - 1) {
        if (cycle + 1 >= TOTAL_CYCLES) {
          setDone(true);
          ambient.volume = 0.1;
          return;
        }
        setCycle(c => c + 1);
        setPhase(0);
      } else {
        setPhase(p => p + 1);
      }
    }, dur);

    return () => clearTimeout(t);
  }, [phase, cycle]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.wrap}>
      <View style={styles.center}>
        <Text style={styles.round}>
          {done ? 'Complete' : `Round ${cycle + 1} of ${TOTAL_CYCLES}`}
        </Text>
        <View style={styles.orbArea}>
          <Animated.View style={[styles.halo, orbStyle]} />
          <Animated.View style={[styles.orb, orbStyle]}>
            <LinearGradient
              colors={[colors.jade400, colors.jade700]}
              start={{ x: 0.36, y: 0.3 }}
              end={{ x: 1, y: 1 }}
              style={styles.orbFill}
            >
              <Text style={styles.phase}>
                {done ? 'Well done' : PHASES[phase].label}
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>
        <Text style={styles.hint}>
          {done
            ? 'Notice — the urge is already softer.'
            : 'Follow the circle with your breath.'}
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        {done
          ? <PanicCta onClick={onDone}>Continue</PanicCta>
          : <PanicCta onClick={onDone}>I'm a little steadier</PanicCta>}
        <TextButton onPress={onSkip}>Skip breathing</TextButton>
      </View>
    </View>
  );
}

const ORB = 210;
const styles = StyleSheet.create({
  wrap:    { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 22 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  round:   { fontSize: 13, fontWeight: '700', letterSpacing: 1, color: colors.jade300, textTransform: 'uppercase' },
  orbArea: { width: ORB, height: ORB, alignItems: 'center', justifyContent: 'center', marginVertical: 26 },
  halo:    { position: 'absolute', width: ORB, height: ORB, borderRadius: ORB / 2, backgroundColor: 'rgba(20,184,136,0.16)' },
  orb:     { width: ORB * 0.74, height: ORB * 0.74, borderRadius: ORB },
  orbFill: { flex: 1, borderRadius: ORB, alignItems: 'center', justifyContent: 'center' },
  phase:   { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 22, color: colors.white },
  hint:    { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
});
