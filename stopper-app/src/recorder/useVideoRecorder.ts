import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as VideoThumbnails from 'expo-video-thumbnails';

export const RECORD_LIMIT_S = 60;
const COUNTDOWN_FROM = 3;
const COUNTDOWN_STEP_MS = 800;

/** Where in the clip to grab the cover frame, in ms. */
const THUMB_AT_MS = 1000;

export type RecorderPhase = 'prep' | 'countdown' | 'recording' | 'review';

export interface Recording {
  videoUri: string;
  /** Frame pulled from the finished clip. Null if generation failed. */
  thumbUri: string | null;
  /** Measured from the clock, not from tick counting. */
  durationSeconds: number;
}

interface Options {
  limitSeconds?: number;
  /** Called once a clip has been recorded and its cover frame generated. */
  onRecorded?: (recording: Recording) => void;
}

/**
 * The whole record flow in one place: permissions, countdown, capture, and the
 * cover frame. Both the vault screen and the community modal drive this, so the
 * two stay in step.
 *
 * The camera sits in video mode the entire time. An earlier version flipped to
 * picture mode to snap a "thumbnail" before recording started — which is why
 * vault covers showed the user's face several seconds before their message
 * began. The cover now comes out of the finished clip.
 */
export function useVideoRecorder({ limitSeconds = RECORD_LIMIT_S, onRecorded }: Options = {}) {
  const cameraRef = useRef<CameraView>(null);
  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();

  const [phase, setPhase] = useState<RecorderPhase>('prep');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [thumbPending, setThumbPending] = useState(false);

  const startedAt = useRef<number | null>(null);
  const cancelled = useRef(false);

  const granted = !!camPerm?.granted && !!micPerm?.granted;

  const requestPermissions = useCallback(() => {
    requestCam();
    requestMic();
  }, [requestCam, requestMic]);

  useEffect(() => { requestPermissions(); }, [requestPermissions]);

  useEffect(() => () => { cancelled.current = true; }, []);

  const stop = useCallback(() => {
    cameraRef.current?.stopRecording();
  }, []);

  // Elapsed time comes from the wall clock. Counting setTimeout ticks drifted,
  // and that drifted number was what got saved as the clip's duration.
  useEffect(() => {
    if (phase !== 'recording') return;
    const tick = setInterval(() => {
      if (startedAt.current == null) return;
      const secs = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(secs);
      if (secs >= limitSeconds) stop();
    }, 250);
    return () => clearInterval(tick);
  }, [phase, limitSeconds, stop]);

  const beginCapture = useCallback(async () => {
    setPhase('recording');
    setElapsed(0);
    startedAt.current = Date.now();

    let clip: { uri: string } | undefined;
    try {
      clip = await cameraRef.current?.recordAsync({ maxDuration: limitSeconds });
    } catch {
      clip = undefined;
    }

    const seconds = startedAt.current
      ? Math.max(1, Math.min(Math.round((Date.now() - startedAt.current) / 1000), limitSeconds))
      : 1;
    startedAt.current = null;

    if (cancelled.current) return;

    if (!clip?.uri) {
      setPhase('prep');
      return;
    }

    const next: Recording = { videoUri: clip.uri, thumbUri: null, durationSeconds: seconds };
    setRecording(next);
    setElapsed(seconds);
    setPhase('review');

    // The cover frame is best-effort — a clip with no cover falls back to the
    // gradient placeholder, which is better than blocking the save on it.
    setThumbPending(true);
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(clip.uri, {
        time: Math.min(THUMB_AT_MS, seconds * 1000),
        quality: 0.6,
      });
      if (cancelled.current) return;
      const withThumb = { ...next, thumbUri: uri };
      setRecording(withThumb);
      onRecorded?.(withThumb);
    } catch {
      if (cancelled.current) return;
      onRecorded?.(next);
    } finally {
      if (!cancelled.current) setThumbPending(false);
    }
  }, [limitSeconds, onRecorded]);

  // Countdown, then roll.
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) {
      const t = setTimeout(() => { beginCapture(); }, COUNTDOWN_STEP_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown(c => c - 1), COUNTDOWN_STEP_MS);
    return () => clearTimeout(t);
  }, [phase, countdown, beginCapture]);

  const start = useCallback(() => {
    setRecording(null);
    setElapsed(0);
    setCountdown(COUNTDOWN_FROM);
    setPhase('countdown');
  }, []);

  const retake = useCallback(() => {
    setRecording(null);
    setElapsed(0);
    setCountdown(COUNTDOWN_FROM);
    setPhase('prep');
  }, []);

  const reset = retake;

  const flipCamera = useCallback(() => {
    setFacing(f => (f === 'front' ? 'back' : 'front'));
  }, []);

  return {
    cameraRef,
    /** CameraView needs a remount to actually switch lens — key it on this. */
    facing,
    flipCamera,
    phase,
    countdown,
    elapsed,
    limitSeconds,
    recording,
    /** True while the cover frame is still being generated. */
    thumbPending,
    granted,
    requestPermissions,
    start,
    stop,
    retake,
    reset,
  };
}
