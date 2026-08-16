import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from 'convex/react';
import { X, LucideIcon, Smartphone, Cigarette, Brain, Wine, Moon, Camera, Video, XCircle } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { CameraRecordModal } from './CameraRecordModal';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { type } from '../../constants/typography';
import * as FileSystem from 'expo-file-system/legacy';
import { api } from '../../../convex/_generated/api';

type Circle = { id: string; name: string; iconKey: string; tint: string };

const CIRCLE_ICONS: Record<string, LucideIcon> = {
  digital: Smartphone, vaping: Cigarette, mindful: Brain, alcohol: Wine, night: Moon,
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (body: string, circleId?: string, mediaStorageId?: string, mediaType?: 'image' | 'video', thumbStorageId?: string) => Promise<void>;
  myHandle: string;
  circles: Circle[];
  initialCircleId?: string;
  initialCircleName?: string;
}

type MediaDraft = { uri: string; type: 'image' | 'video'; mimeType: string };

export function PostComposerModal({ visible, onClose, onSubmit, myHandle, circles, initialCircleId, initialCircleName }: Props) {
  const insets = useSafeAreaInsets();
  const generateUploadUrl = useMutation(api.community.generateUploadUrl);

  const [body, setBody] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<string | undefined>(initialCircleId);
  const [media, setMedia] = useState<MediaDraft | null>(null);
  const [thumbLocalUri, setThumbLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraRecorderOpen, setCameraRecorderOpen] = useState(false);

  const canPost = body.trim().length > 0 || !!media;

  const clearMedia = () => {
    setMedia(null);
    setThumbLocalUri(null);
  };

  const pickMedia = async (mediaType: 'image' | 'video') => {
    if (mediaType === 'video') {
      // Use CameraRecordModal so we can capture a thumbnail snapshot before recording
      setCameraRecorderOpen(true);
      return;
    }
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Allow camera access to share your progress.'); return; }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        setMedia({
          uri: asset.uri,
          type: 'image',
          mimeType: asset.mimeType ?? 'image/jpeg',
        });
        setThumbLocalUri(null);
      }
    } catch {
      Alert.alert('Could not open camera');
    }
  };

  const handleVideoRecorded = ({ videoUri, thumbUri }: { videoUri: string; thumbUri: string | null }) => {
    setCameraRecorderOpen(false);
    setMedia({ uri: videoUri, type: 'video', mimeType: videoUri.endsWith('.mov') ? 'video/quicktime' : 'video/mp4' });
    setThumbLocalUri(thumbUri);
  };

  const uploadMedia = async (draft: MediaDraft): Promise<{ storageId: string; mediaType: 'image' | 'video'; thumbStorageId?: string }> => {
    const [uploadUrl, thumbUploadUrl] = await Promise.all([
      generateUploadUrl(),
      thumbLocalUri ? generateUploadUrl() : Promise.resolve(''),
    ]);

    const [result, thumbStorageId] = await Promise.all([
      FileSystem.uploadAsync(uploadUrl, draft.uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: { 'Content-Type': draft.mimeType },
      }),
      thumbLocalUri
        ? (async (): Promise<string | undefined> => {
            try {
              // thumbLocalUri is already in documentDirectory — upload directly, same path as video.
              const tRes = await FileSystem.uploadAsync(thumbUploadUrl, thumbLocalUri, {
                httpMethod: 'POST',
                headers: { 'Content-Type': 'image/jpeg' },
                uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
              });
              if (tRes.status >= 200 && tRes.status < 300) {
                return (JSON.parse(tRes.body) as { storageId: string }).storageId;
              }
            } catch {}
            return undefined;
          })()
        : Promise.resolve(undefined),
    ]);

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Upload failed with status ${result.status}: ${result.body}`);
    }
    const { storageId } = result.body ? JSON.parse(result.body) : {};
    if (!storageId) throw new Error(`No storageId in response: ${result.body}`);

    return { storageId, mediaType: draft.type, thumbStorageId };
  };

  const handlePost = async () => {
    if (!canPost || loading) return;
    setLoading(true);
    try {
      let storageId: string | undefined;
      let mediaType: 'image' | 'video' | undefined;
      let thumbStorageId: string | undefined;
      if (media) {
        const result = await uploadMedia(media);
        storageId = result.storageId;
        mediaType = result.mediaType;
        thumbStorageId = result.thumbStorageId;
      }
      await onSubmit(body.trim(), selectedCircle, storageId, mediaType, thumbStorageId);
      setBody('');
      clearMedia();
      setSelectedCircle(initialCircleId);
      onClose();
    } catch {
      Alert.alert('Could not post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <CameraRecordModal
        visible={cameraRecorderOpen}
        onClose={() => setCameraRecorderOpen(false)}
        onDone={handleVideoRecorded}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
            <Text style={styles.title}>New post</Text>
            <Pressable
              onPress={handlePost}
              disabled={!canPost || loading}
              accessibilityRole="button"
              style={[styles.postBtn, !canPost && !loading && styles.postBtnDisabled]}
            >
              {loading
                ? <ActivityIndicator size="small" color={colors.onAccent} />
                : <Text style={[styles.postBtnTxt, !canPost && { opacity: 0.4 }]}>Post</Text>
              }
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            {/* Compose area */}
            <View style={styles.compose}>
              <Avatar handle={myHandle} tint={colors.jade500} size={42} />
              <TextInput
                style={styles.input}
                placeholder="Share a win, struggle, or words of support…"
                placeholderTextColor={colors.textFaint}
                multiline
                autoFocus
                value={body}
                onChangeText={setBody}
                maxLength={500}
              />
            </View>

            {/* Media preview */}
            {media && (
              <View style={styles.mediaPreviewWrap}>
                {media.type === 'image' ? (
                  <Image source={{ uri: media.uri }} style={styles.mediaPreview} resizeMode="cover" />
                ) : thumbLocalUri ? (
                  <Image source={{ uri: thumbLocalUri }} style={styles.mediaPreview} resizeMode="cover" />
                ) : (
                  <View style={[styles.mediaPreview, { backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }]}>
                    <Video size={36} color="rgba(255,255,255,0.4)" />
                  </View>
                )}
                {media.type === 'video' && (
                  <View style={styles.videoOverlay}>
                    <Video size={28} color="#fff" />
                  </View>
                )}
                <Pressable onPress={clearMedia} style={styles.removeMedia} accessibilityLabel="Remove media">
                  <XCircle size={22} color="#fff" />
                </Pressable>
              </View>
            )}

            {/* Circle context */}
            {initialCircleId && initialCircleName ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Posting to</Text>
                <View style={[styles.circleChip, { borderColor: colors.jade500, backgroundColor: 'rgba(20,184,136,0.12)' }]}>
                  <Text style={[styles.circleChipTxt, { color: colors.jade300 }]}>{initialCircleName}</Text>
                </View>
              </View>
            ) : circles.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Post to a circle (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.circleRow}>
                  {circles.map(c => {
                    const Icon = CIRCLE_ICONS[c.iconKey] ?? Smartphone;
                    const on = selectedCircle === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setSelectedCircle(on ? undefined : c.id)}
                        style={[styles.circleChip, on && { borderColor: c.tint, backgroundColor: c.tint + '22' }]}
                      >
                        <Icon size={14} color={on ? c.tint : colors.textMuted} />
                        <Text style={[styles.circleChipTxt, { color: on ? c.tint : colors.textMuted }]}>{c.name}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}
          </ScrollView>

          {/* Media toolbar */}
          {!media && (
            <View style={styles.toolbar}>
              <Pressable onPress={() => pickMedia('image')} style={styles.toolBtn} accessibilityLabel="Take photo">
                <Camera size={20} color={colors.jade400} />
                <Text style={styles.toolTxt}>Photo</Text>
              </Pressable>
              <Pressable onPress={() => pickMedia('video')} style={styles.toolBtn} accessibilityLabel="Record video">
                <Video size={20} color={colors.jade400} />
                <Text style={styles.toolTxt}>Video</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screenPad, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.body, fontWeight: '700', color: colors.white },
  postBtn: { backgroundColor: colors.jade500, paddingHorizontal: 20, paddingVertical: 9, borderRadius: radius.pill },
  postBtnDisabled: { backgroundColor: colors.surface3 },
  postBtnTxt: { fontWeight: '700', fontSize: 14, color: colors.onAccent },
  compose: { flexDirection: 'row', gap: 14, padding: spacing.screenPad, paddingBottom: 8 },
  input: { flex: 1, fontSize: 16, color: colors.white, lineHeight: 24, minHeight: 100, textAlignVertical: 'top' },
  mediaPreviewWrap: { marginHorizontal: spacing.screenPad, marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  mediaPreview: { width: '100%', height: 200 },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  removeMedia: { position: 'absolute', top: 8, right: 8 },
  section: { paddingHorizontal: spacing.screenPad, paddingTop: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textFaint, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  circleRow: { gap: 8, paddingBottom: 4 },
  circleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface1 },
  circleChipTxt: { fontSize: 13, fontWeight: '600' },
  toolbar: { flexDirection: 'row', gap: 0, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.screenPad, paddingVertical: 10 },
  toolBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: 'rgba(20,184,136,0.10)', marginRight: 10 },
  toolTxt: { fontSize: 14, fontWeight: '700', color: colors.jade400 },
});
