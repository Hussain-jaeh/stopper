import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { X, FlipHorizontal2 } from 'lucide-react-native';
import { colors } from '../constants/colors';
import type { useVideoRecorder } from './useVideoRecorder';

type Recorder = ReturnType<typeof useVideoRecorder>;

interface Props {
  recorder: Recorder;
  onClose: () => void;
  /** Copy shown before recording starts. */
  prepTitle: string;
  prepBody?: string;
  /** Copy shown over the review controls. */
  reviewTitle: string;
  reviewBody?: string;
  /** Denied-permission copy. */
  permissionTitle?: string;
  permissionBody?: string;
  /** Rendered above the review actions — e.g. the cover-frame preview. */
  reviewExtra?: React.ReactNode;
  /** Buttons for the review phase; the shell owns every other phase's controls. */
  reviewActions: React.ReactNode;
  /** Replaces the whole centre + bottom area, for saving/saved states. */
  overlay?: React.ReactNode;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * The camera chrome shared by every recorder in the app: preview surface,
 * countdown, running timer, progress bar and the record/stop button. Callers
 * supply their own copy and their own review actions.
 */
export function RecorderShell({
  recorder,
  onClose,
  prepTitle,
  prepBody,
  reviewTitle,
  reviewBody,
  permissionTitle = 'Camera & mic access',
  permissionBody = 'Stopper needs both to record. Nothing is uploaded until you choose to save.',
  reviewExtra,
  reviewActions,
  overlay,
}: Props) {
  const insets = useSafeAreaInsets();
  const { phase, countdown, elapsed, limitSeconds, facing, flipCamera, cameraRef, granted, requestPermissions } = recorder;

  if (!granted) {
    return (
      <View style={[styles.root, styles.center, { padding: 32 }]}>
        <Text style={recorderStyles.h}>{permissionTitle}</Text>
        <Text style={recorderStyles.p}>{permissionBody}</Text>
        <Pressable onPress={requestPermissions} style={styles.allowBtn}>
          <Text style={styles.allowTxt}>Allow access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Keyed on facing: expo-camera needs a remount for the lens swap to take. */}
      <CameraView
        key={facing}
        ref={cameraRef}
        mode="video"
        style={StyleSheet.absoluteFill}
        facing={facing}
        videoQuality="720p"
      />

      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={onClose} accessibilityLabel="Close" style={styles.iconBtn}>
          <X size={18} color={colors.white} />
        </Pressable>
        {phase === 'recording' && (
          <View style={styles.timer}>
            <View style={styles.redDot} />
            <Text style={styles.timerTxt}>{mmss(elapsed)} / {mmss(limitSeconds)}</Text>
          </View>
        )}
        {phase === 'prep' ? (
          <Pressable onPress={flipCamera} accessibilityLabel="Flip camera" style={styles.iconBtn}>
            <FlipHorizontal2 size={18} color={colors.white} />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {overlay ?? (
        <>
          <View style={[styles.center, { flex: 1, paddingHorizontal: 32 }]}>
            {phase === 'prep' && (
              <Animated.View entering={FadeIn.duration(400)} style={styles.center}>
                <Text style={recorderStyles.h}>{prepTitle}</Text>
                {prepBody ? <Text style={recorderStyles.p}>{prepBody}</Text> : null}
              </Animated.View>
            )}
            {phase === 'countdown' && countdown > 0 && (
              <Animated.Text key={countdown} entering={ZoomIn.duration(400)} style={styles.count}>
                {countdown}
              </Animated.Text>
            )}
            {phase === 'review' && (
              <Animated.View entering={FadeIn.duration(300)} style={styles.center}>
                {reviewExtra}
                <Text style={recorderStyles.h}>{reviewTitle}</Text>
                {reviewBody ? <Text style={recorderStyles.p}>{reviewBody}</Text> : null}
              </Animated.View>
            )}
          </View>

          <View style={[styles.bottom, { paddingBottom: insets.bottom + 26 }]}>
            {phase === 'recording' && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, (elapsed / limitSeconds) * 100)}%` }]} />
              </View>
            )}
            {phase === 'prep' && (
              <Pressable onPress={recorder.start} accessibilityLabel="Start recording" style={styles.recBtn} />
            )}
            {phase === 'recording' && (
              <Pressable onPress={recorder.stop} accessibilityLabel="Stop recording" style={[styles.recBtn, styles.stopBtn]}>
                <View style={styles.stopSquare} />
              </Pressable>
            )}
            {phase === 'review' && (
              <View style={styles.reviewRow}>{reviewActions}</View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

export const recorderStyles = StyleSheet.create({
  ghost: {
    flex: 1, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ghostTxt: { fontSize: 15, fontWeight: '700', color: colors.white },
  cta: { height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaTxt: { fontSize: 15, fontWeight: '800', color: colors.onAccent },
  h: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 24, lineHeight: 30, color: colors.white, textAlign: 'center' },
  p: { fontSize: 14.5, color: 'rgba(255,255,255,0.65)', marginTop: 14, lineHeight: 21, textAlign: 'center' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
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
  timerTxt: { fontSize: 13.5, fontWeight: '700', color: colors.white },
  count: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 110, color: colors.white },
  bottom: { paddingHorizontal: 24, alignItems: 'center', gap: 14 },
  reviewRow: { flexDirection: 'row', gap: 12, width: '100%' },
  progressTrack: { width: '100%', height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.jade500 },
  recBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FF4D4D', borderWidth: 5, borderColor: 'rgba(255,255,255,0.85)' },
  stopBtn: { backgroundColor: 'rgba(255,77,77,0.25)', alignItems: 'center', justifyContent: 'center' },
  stopSquare: { width: 26, height: 26, borderRadius: 7, backgroundColor: '#FF4D4D' },
  allowBtn: { marginTop: 20, backgroundColor: colors.jade500, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 16 },
  allowTxt: { fontSize: 15, fontWeight: '700', color: colors.white },
});
