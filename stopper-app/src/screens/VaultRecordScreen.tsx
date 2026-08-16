import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { X, RotateCcw, Check, Video, FlipHorizontal2 } from 'lucide-react-native';
import { useMutation } from 'convex/react';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import { api } from '../../convex/_generated/api';
import { colors, gradients } from '../constants/colors';
import { spacing, shadow } from '../constants/spacing';

const LIMIT_S = 60;
type Phase = 'prep' | 'count' | 'rec' | 'review' | 'saving' | 'saved';

export function VaultRecordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const cam = useRef<CameraView>(null);
  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();
  const [phase, setPhase] = useState<Phase>('prep');
  const [camMode, setCamMode] = useState<'picture' | 'video'>('picture');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [count, setCount] = useState(3);
  const [sec, setSec] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const prefetchedVideoUrl = useRef<string | null>(null);
  const thumbBase64 = useRef<string | null>(null);
  const thumbPermUri = useRef<string | null>(null);

  const camReady = useRef(false);

  const generateUploadUrl = useMutation(api.vault.generateUploadUrl);
  const saveRecordingMutation = useMutation(api.vault.saveRecording);

  useEffect(() => { requestCam(); requestMic(); }, []);

  useEffect(() => {
    if (phase !== 'count') return;
    if (count === 0) {
      const t = setTimeout(() => startRecording(), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== 'rec') return;
    if (sec >= LIMIT_S) { stopRecording(); return; }
    const t = setTimeout(() => setSec(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [phase, sec]);

  const resetThumb = () => {
    thumbBase64.current = null;
    thumbPermUri.current = null;
    setThumbPreview(null);
  };

  const flipCamera = () => {
    camReady.current = false;
    setFacing(f => f === 'front' ? 'back' : 'front');
  };

  const handleRecordTap = async () => {
    resetThumb();
    prefetchedVideoUrl.current = null;

    try {
      const snap = await cam.current?.takePictureAsync({ quality: 0.5, base64: true });
      if (snap?.uri) {
        setThumbPreview(snap.uri);
        if (snap.base64) {
          thumbBase64.current = snap.base64;
        } else {
          const permUri = (FileSystem.documentDirectory ?? '') + 'vault_thumb_' + Date.now() + '.jpg';
          await FileSystem.copyAsync({ from: snap.uri, to: permUri });
          thumbPermUri.current = permUri;
          setThumbPreview(permUri);
        }
      }
    } catch {}

    camReady.current = false;
    setCamMode('video');
    setCount(3);
    setPhase('count');
  };

  const startRecording = async () => {
    setPhase('rec'); setSec(0);
    try {
      const video = await cam.current?.recordAsync({ maxDuration: LIMIT_S });
      if (video?.uri) {
        setVideoUri(video.uri);
        setPhase('review');
        generateUploadUrl()
          .then(url => { prefetchedVideoUrl.current = url; })
          .catch(() => {});
      }
    } catch { setPhase('prep'); }
  };

  const stopRecording = () => cam.current?.stopRecording();

  const onSave = async () => {
    if (!videoUri) return;
    setPhase('saving');
    try {
      let thumbStorageId: string | undefined;
      const hasThumb = !!(thumbBase64.current || thumbPermUri.current);
      if (hasThumb) {
        try {
          let fileUri: string;
          if (thumbBase64.current) {
            fileUri = `${FileSystem.documentDirectory ?? ''}vault_thumb_upload.jpg`;
            await FileSystem.writeAsStringAsync(fileUri, thumbBase64.current, {
              encoding: FileSystem.EncodingType.Base64,
            });
          } else {
            fileUri = thumbPermUri.current!;
          }
          const thumbUrl = await generateUploadUrl();
          const tRes = await FileSystem.uploadAsync(thumbUrl, fileUri, {
            httpMethod: 'POST',
            headers: { 'Content-Type': 'image/jpeg' },
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          });
          if (tRes.status >= 200 && tRes.status < 300) {
            thumbStorageId = (JSON.parse(tRes.body) as { storageId: string }).storageId;
          }
          if (thumbBase64.current) {
            FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
          }
        } catch { /* proceed without thumbnail */ }
      }

      const videoUrl = prefetchedVideoUrl.current ?? await generateUploadUrl();
      const mime = videoUri.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';

      const vRes = await FileSystem.uploadAsync(videoUrl, videoUri, {
        httpMethod: 'POST',
        headers: { 'Content-Type': mime },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      if (vRes.status !== 200) throw new Error(`Upload HTTP ${vRes.status}`);
      const { storageId } = JSON.parse(vRes.body);

      await saveRecordingMutation({
        storageId,
        thumbStorageId,
        durationSeconds: Math.max(1, Math.min(sec, LIMIT_S)),
      });
      setPhase('saved');
    } catch {
      Alert.alert('Save failed', 'Your message is still here — check your connection and try again.');
      setPhase('review');
    }
  };

  const mmss = (s: number) => `0:${String(s).padStart(2, '0')}`;

  if (!camPerm?.granted || !micPerm?.granted) {
    return (
      <View style={[styles.root, styles.center, { padding: 32 }]}>
        <Video size={40} color={colors.jade400} />
        <Text style={styles.h}>Camera & mic access</Text>
        <Text style={styles.p}>Stopper needs both to record your message. It never leaves your vault.</Text>
        <Pressable onPress={() => { requestCam(); requestMic(); }} style={[shadow.cta, { marginTop: 20 }]}>
          <LinearGradient colors={gradients.primary} style={styles.cta}><Text style={styles.ctaTxt}>Allow access</Text></LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cam} mode={camMode} style={StyleSheet.absoluteFill} facing={facing} videoQuality="720p" onCameraReady={() => { camReady.current = true; }} />

      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Close" style={styles.close}><X size={18} color={colors.white} /></Pressable>
        {phase === 'rec' && (
          <View style={styles.timer}>
            <View style={styles.redDot} />
            <Text style={styles.timerTxt}>{mmss(sec)} / 1:00</Text>
          </View>
        )}
        {phase === 'prep' ? (
          <Pressable onPress={flipCamera} accessibilityLabel="Flip camera" style={styles.close}>
            <FlipHorizontal2 size={18} color={colors.white} />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <View style={[styles.center, { flex: 1, paddingHorizontal: 32 }]}>
        {phase === 'prep' && (
          <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center' }}>
            <Text style={styles.h}>What do you want{'\n'}future you to remember?</Text>
            <Text style={styles.p}>Speak like you're talking to a friend.{'\n'}30–60 seconds. Only you will ever see this.</Text>
          </Animated.View>
        )}
        {phase === 'count' && count > 0 && (
          <Animated.Text key={count} entering={ZoomIn.duration(400)} style={styles.count}>{count}</Animated.Text>
        )}
        {phase === 'review' && (
          <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center' }}>
            {thumbPreview ? (
              <Image source={{ uri: thumbPreview }} style={styles.thumbPreview} />
            ) : null}
            <Text style={styles.h}>Keep this one?</Text>
            <Text style={styles.p}>{mmss(Math.min(sec, LIMIT_S))} · saved privately to your vault</Text>
          </Animated.View>
        )}
        {(phase === 'saving') && (
          <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center' }}>
            <Text style={styles.h}>Saving…</Text>
          </Animated.View>
        )}
        {phase === 'saved' && (
          <Animated.View entering={ZoomIn.duration(400)} style={{ alignItems: 'center' }}>
            <LinearGradient colors={gradients.primary} style={styles.savedBadge}><Check size={34} color={colors.onAccent} strokeWidth={3} /></LinearGradient>
            <Text style={[styles.h, { marginTop: 18 }]}>Saved to your vault</Text>
            <Text style={styles.p}>Future you says thank you.</Text>
          </Animated.View>
        )}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 26 }]}>
        {phase === 'rec' && (
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(sec / LIMIT_S) * 100}%` }]} /></View>
        )}
        {phase === 'prep' && (
          <Pressable onPress={handleRecordTap} accessibilityLabel="Start recording" style={styles.recBtn} />
        )}
        {phase === 'rec' && (
          <Pressable onPress={stopRecording} accessibilityLabel="Stop recording" style={[styles.recBtn, styles.stopBtn]}>
            <View style={styles.stopSquare} />
          </Pressable>
        )}
        {phase === 'review' && (
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <Pressable onPress={() => { resetThumb(); setCamMode('picture'); setVideoUri(null); setSec(0); setPhase('prep'); }} style={styles.ghost}>
              <RotateCcw size={17} color={colors.white} /><Text style={styles.ghostTxt}>Re-record</Text>
            </Pressable>
            <Pressable onPress={onSave} style={[{ flex: 1 }, shadow.cta]}>
              <LinearGradient colors={gradients.primary} style={styles.cta}><Check size={17} color={colors.onAccent} /><Text style={styles.ctaTxt}>Save message</Text></LinearGradient>
            </Pressable>
          </View>
        )}
        {phase === 'saved' && (
          <Pressable onPress={() => navigation.goBack()} style={[{ width: '100%' }, shadow.cta]}>
            <LinearGradient colors={gradients.primary} style={styles.cta}><Text style={styles.ctaTxt}>Done</Text></LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screenPad },
  close: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D' },
  timerTxt: { fontSize: 13.5, fontWeight: '700', color: colors.white },
  h: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 24, lineHeight: 30, color: colors.white, textAlign: 'center' },
  p: { fontSize: 14.5, color: 'rgba(255,255,255,0.65)', marginTop: 14, lineHeight: 21, textAlign: 'center' },
  count: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 110, color: colors.white },
  thumbPreview: { width: 90, height: 90, borderRadius: 16, marginBottom: 16, borderWidth: 2, borderColor: colors.jade500 },
  savedBadge: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingHorizontal: 24, alignItems: 'center', gap: 14 },
  progressTrack: { width: '100%', height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.jade500 },
  recBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FF4D4D', borderWidth: 5, borderColor: 'rgba(255,255,255,0.85)' },
  stopBtn: { backgroundColor: 'rgba(255,77,77,0.25)', alignItems: 'center', justifyContent: 'center' },
  stopSquare: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#FF4D4D' },
  ghost: { flex: 1, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ghostTxt: { fontSize: 15, fontWeight: '700', color: colors.white },
  cta: { height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaTxt: { fontSize: 15, fontWeight: '800', color: colors.onAccent },
});
