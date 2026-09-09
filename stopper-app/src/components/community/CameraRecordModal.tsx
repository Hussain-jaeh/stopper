import { useEffect } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Check, RotateCcw } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useVideoRecorder } from '../../recorder/useVideoRecorder';
import { RecorderShell, recorderStyles } from '../../recorder/RecorderShell';

interface Result {
  videoUri: string;
  thumbUri: string | null;
  durationSeconds: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onDone: (result: Result) => void;
}

/**
 * Community video capture. Shares its whole state machine and chrome with the
 * vault recorder — this component only supplies the copy and hands the clip
 * back to the composer, which owns the upload.
 */
export function CameraRecordModal({ visible, onClose, onDone }: Props) {
  const recorder = useVideoRecorder();
  const { reset } = recorder;

  // Each open starts from a clean slate rather than the last clip's review screen.
  useEffect(() => { if (visible) reset(); }, [visible, reset]);

  if (!visible) return null;

  const clip = recorder.recording;

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <RecorderShell
        recorder={recorder}
        onClose={onClose}
        prepTitle="Record a video"
        prepBody="Up to 60 seconds. Tap the button to start."
        reviewTitle="Keep this clip?"
        reviewBody={clip ? `${clip.durationSeconds}s` : undefined}
        permissionTitle="Camera & mic needed"
        permissionBody="Both are needed to record a video for your post."
        reviewActions={
          <>
            <Pressable onPress={recorder.retake} style={recorderStyles.ghost}>
              <RotateCcw size={17} color={colors.white} />
              <Text style={recorderStyles.ghostTxt}>Re-record</Text>
            </Pressable>
            <Pressable
              onPress={() => clip && onDone(clip)}
              disabled={!clip}
              style={[styles.confirm, !clip && { opacity: 0.5 }]}
            >
              <Check size={17} color={colors.white} />
              <Text style={styles.confirmTxt}>Use this</Text>
            </Pressable>
          </>
        }
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  confirm: {
    flex: 1, height: 52, borderRadius: 16, backgroundColor: colors.jade500,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  confirmTxt: { fontSize: 15, fontWeight: '800', color: colors.white },
});
