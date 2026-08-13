import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { X, Check, RotateCcw } from 'lucide-react-native';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';
import { colors } from '../../constants/colors';

const LIMIT_S = 60;
type Phase = 'prep' | 'count' | 'rec' | 'review';

interface Result {
  videoUri: string;
  thumbUri: string | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onDone: (result: Result) => void;
}

export function CameraRecordModal({ visible, onClose, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const cam = useRef<CameraView>(null);
  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();
  const [camMode, setCamMode] = useState<'picture' | 'video'>('picture');
  const [phase, setPhase] = useState<Phase>('prep');
  const [count, setCount] = useState(3);
  const [sec, setSec] = useState(0);

  const thumbUri = useRef<string | null>(null);
  const videoUri = useRef<string | null>(null);

  useEffect(() => {
    if (visible) { requestCam(); requestMic(); }
  }, [visible]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCamMode('picture');
      setPhase('prep');
      setCount(3);
      setSec(0);
      thumbUri.current = null;
      videoUri.current = null;
    }
  }, [visible]);

  useEffect(() => {
    if (phase !== 'count') return;
    if (count === 0) {
      const t = setTimeout(() => startRecording(), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== 'rec') return;
    if (sec >= LIMIT_S) { cam.current?.stopRecording(); return; }
    const t = setTimeout(() => setSec(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [phase, sec]);

  const handleTap = async () => {
    thumbUri.current = null;
    try {
      const snap = await cam.current?.takePictureAsync({ quality: 0.6 });
      thumbUri.current = snap?.uri ?? null;
    } catch {}
    setCamMode('video');
    setCount(3);
    setPhase('count');
  };

  const startRecording = async () => {
    setPhase('rec'); setSec(0);
    try {
      const video = await cam.current?.recordAsync({ maxDuration: LIMIT_S });
      if (video?.uri) {
        videoUri.current = video.uri;
        setPhase('review');
      } else {
        reset();
      }
    } catch {
      reset();
    }
  };

  const reset = () => {
    thumbUri.current = null;
    videoUri.current = null;
    setCamMode('picture');
    setSec(0);
    setCount(3);
    setPhase('prep');
  };

  const handleConfirm = () => {
    if (!videoUri.current) return;
    onDone({ videoUri: videoUri.current, thumbUri: thumbUri.current });
  };

  const mmss = (s: number) => `0:${String(s).padStart(2, '0')}`;

  if (!visible) return null;

  if (!camPerm?.granted || !micPerm?.granted) {
    return (
      <View style={[styles.root, styles.center, { padding: 32 }]}>
        <Text style={styles.h}>Camera & mic needed</Text>
        <Pressable onPress={() => { requestCam(); requestMic(); }} style={styles.allowBtn}>
          <Text style={styles.allowTxt}>Allow access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
        <CameraView ref={cam} mode={camMode} style={StyleSheet.absoluteFill} facing="front" videoQuality="720p" />

        {/* Top bar */}
        <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={onClose} style={styles.iconBtn}><X size={18} color="#fff" /></Pressable>
          {phase === 'rec' && (
            <View style={styles.timer}>
              <View style={styles.redDot} />
              <Text style={styles.timerTxt}>{mmss(sec)} / 1:00</Text>
            </View>
          )}
          <View style={{ width: 38 }} />
        </View>

        {/* Center overlay */}
        <View style={[styles.center, { flex: 1 }]}>
          {phase === 'prep' && (
            <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center', paddingHorizontal: 32 }}>
              <Text style={styles.h}>Record a video</Text>
              <Text style={styles.p}>Up to 60 seconds. Tap the button to start.</Text>
            </Animated.View>
          )}
          {phase === 'count' && count > 0 && (
            <Animated.Text key={count} entering={ZoomIn.duration(300)} style={styles.count}>{count}</Animated.Text>
          )}
          {phase === 'review' && (
            <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center', paddingHorizontal: 32 }}>
              <Text style={styles.h}>Keep this clip?</Text>
              <Text style={styles.p}>{mmss(Math.min(sec, LIMIT_S))}</Text>
            </Animated.View>
          )}
        </View>

        {/* Bottom controls */}
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 26 }]}>
          {phase === 'rec' && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(sec / LIMIT_S) * 100}%` }]} />
            </View>
          )}
          {phase === 'prep' && (
            <Pressable onPress={handleTap} style={styles.recBtn} accessibilityLabel="Start recording" />
          )}
          {phase === 'rec' && (
            <Pressable onPress={() => cam.current?.stopRecording()} style={[styles.recBtn, styles.stopBtn]}>
              <View style={styles.stopSquare} />
            </Pressable>
          )}
          {phase === 'review' && (
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Pressable onPress={reset} style={styles.ghost}>
                <RotateCcw size={17} color="#fff" />
                <Text style={styles.ghostTxt}>Re-record</Text>
              </Pressable>
              <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
                <Check size={17} color="#fff" />
                <Text style={styles.confirmTxt}>Use this</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', zIndex: 100 },
  center: { alignItems: 'center', justifyContent: 'center' },
  top: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  timer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
  },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D' },
  timerTxt: { fontSize: 13.5, fontWeight: '700', color: '#fff' },
  h: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 22, color: '#fff', textAlign: 'center' },
  p: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 10, textAlign: 'center' },
  count: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 110, color: '#fff' },
  bottom: { paddingHorizontal: 24, alignItems: 'center', gap: 14 },
  progressTrack: { width: '100%', height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.jade500 },
  recBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FF4D4D', borderWidth: 5, borderColor: 'rgba(255,255,255,0.85)' },
  stopBtn: { backgroundColor: 'rgba(255,77,77,0.25)', alignItems: 'center', justifyContent: 'center' },
  stopSquare: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#FF4D4D' },
  ghost: {
    flex: 1, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ghostTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  confirmBtn: {
    flex: 1, height: 52, borderRadius: 16,
    backgroundColor: colors.jade500,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  confirmTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
  allowBtn: { marginTop: 20, backgroundColor: colors.jade500, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 16 },
  allowTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
