import { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { RotateCcw, Check } from 'lucide-react-native';
import { useMutation } from 'convex/react';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../convex/_generated/api';
import { AccountPrompt } from '../components/account/AccountPrompt';
import { useGuestUpgrade } from '../auth/GuestUpgrade';
import { colors, gradients } from '../constants/colors';
import { shadow } from '../constants/spacing';
import { useVideoRecorder } from '../recorder/useVideoRecorder';
import { RecorderShell, recorderStyles } from '../recorder/RecorderShell';
import { uploadFile, videoContentType } from '../recorder/uploadFile';

type SaveState = 'idle' | 'saving' | 'saved';

export function VaultRecordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const recorder = useVideoRecorder();
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [accountPrompt, setAccountPrompt] = useState(false);
  const { startUpgrade } = useGuestUpgrade();

  const generateUploadUrl = useMutation(api.vault.generateUploadUrl);
  const saveRecording = useMutation(api.vault.saveRecording);
  const claimAccountPrompt = useMutation(api.guest.claimAccountPrompt);

  const onSave = async () => {
    const clip = recorder.recording;
    if (!clip) return;
    setSaveState('saving');

    try {
      // Cover frame first, and never fatal — a clip without one just falls back
      // to the gradient placeholder in the vault list.
      let thumbStorageId: string | undefined;
      if (clip.thumbUri) {
        try {
          thumbStorageId = await uploadFile(await generateUploadUrl(), clip.thumbUri, 'image/jpeg');
        } catch {}
      }

      const storageId = await uploadFile(
        await generateUploadUrl(),
        clip.videoUri,
        videoContentType(clip.videoUri),
      );

      await saveRecording({
        storageId: storageId as any,
        thumbStorageId: thumbStorageId as any,
        durationSeconds: clip.durationSeconds,
      });
      setSaveState('saved');

      // A vault message is the least replaceable thing in the app — it exists
      // nowhere else. This is the one moment where offering an account is a
      // service rather than an interruption. Claimed here because this is
      // where it can actually be shown; a guest sees it once, ever.
      try {
        if (await claimAccountPrompt({ prompt: 'first-vault' })) {
          setAccountPrompt(true);
        }
      } catch {}
    } catch {
      Alert.alert('Save failed', 'Your message is still here — check your connection and try again.');
      setSaveState('idle');
    }
  };

  const savingOverlay = saveState !== 'idle' ? (
    <>
      <View style={styles.overlayCentre}>
        {saveState === 'saving' ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.centre}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={[recorderStyles.h, { marginTop: 18 }]}>Saving…</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={ZoomIn.duration(400)} style={styles.centre}>
            <LinearGradient colors={gradients.primary} style={styles.savedBadge}>
              <Check size={34} color={colors.onAccent} strokeWidth={3} />
            </LinearGradient>
            <Text style={[recorderStyles.h, { marginTop: 18 }]}>Saved to your vault</Text>
            <Text style={recorderStyles.p}>Future you says thank you.</Text>
          </Animated.View>
        )}
      </View>
      <View style={[styles.overlayBottom, { paddingBottom: insets.bottom + 26 }]}>
        {saveState === 'saved' && (
          <Pressable onPress={() => navigation.goBack()} style={[{ width: '100%' }, shadow.cta]}>
            <LinearGradient colors={gradients.primary} style={recorderStyles.cta}>
              <Text style={recorderStyles.ctaTxt}>Done</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </>
  ) : undefined;

  return (
    <>
      <AccountPrompt
        visible={accountPrompt}
        promptId="first-vault"
        onCreateAccount={() => { setAccountPrompt(false); startUpgrade(); }}
        onDismiss={() => setAccountPrompt(false)}
      />
      <RecorderShell
      recorder={recorder}
      onClose={() => navigation.goBack()}
      overlay={savingOverlay}
      prepTitle={`What do you want\nfuture you to remember?`}
      prepBody={`Speak like you're talking to a friend.\n30–60 seconds. Only you will ever see this.`}
      reviewTitle="Keep this one?"
      reviewBody={`${recorder.recording?.durationSeconds ?? 0}s · saved privately to your vault`}
      permissionBody="Stopper needs both to record your message. It never leaves your vault."
      reviewExtra={
        recorder.recording?.thumbUri ? (
          <Image source={{ uri: recorder.recording.thumbUri }} style={styles.coverPreview} />
        ) : recorder.thumbPending ? (
          <View style={[styles.coverPreview, styles.centre]}>
            <ActivityIndicator color={colors.jade400} />
          </View>
        ) : null
      }
      reviewActions={
        <>
          <Pressable onPress={recorder.retake} style={recorderStyles.ghost}>
            <RotateCcw size={17} color={colors.white} />
            <Text style={recorderStyles.ghostTxt}>Re-record</Text>
          </Pressable>
          <Pressable onPress={onSave} style={[{ flex: 1 }, shadow.cta]}>
            <LinearGradient colors={gradients.primary} style={recorderStyles.cta}>
              <Check size={17} color={colors.onAccent} />
              <Text style={recorderStyles.ctaTxt}>Save message</Text>
            </LinearGradient>
          </Pressable>
        </>
      }
      />
    </>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center' },
  overlayCentre: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  overlayBottom: { paddingHorizontal: 24, alignItems: 'center' },
  coverPreview: {
    width: 90, height: 90, borderRadius: 16, marginBottom: 16,
    borderWidth: 2, borderColor: colors.jade500, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  savedBadge: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' },
});
