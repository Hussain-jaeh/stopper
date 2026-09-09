import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent, useEventListener } from 'expo';
import { useQuery } from 'convex/react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { X, Play, VideoOff } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { colors } from '../constants/colors';
import { RootStackParamList } from '../navigation/TabNavigator';

type Route = RouteProp<RootStackParamList, 'VaultPlay'>;

export function VaultPlayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { params } = useRoute<Route>();
  const { recordingId, uri: directUri, title, day } = params;

  // Vault clips resolve a fresh signed URL here rather than carrying one
  // through navigation state, where it can outlive its own expiry. Community
  // videos already come with a URL in hand and skip the query.
  const resolved = useQuery(
    api.vault.getPlaybackUrl,
    recordingId ? { id: recordingId as any } : 'skip',
  );

  const sourceUri = directUri ?? resolved ?? null;
  const resolving = !!recordingId && resolved === undefined;
  const unavailable = !resolving && !sourceUri;

  const [failed, setFailed] = useState(false);

  const player = useVideoPlayer(sourceUri, (p) => { p.play(); });

  // Play/pause is read off the player rather than mirrored into local state,
  // so the button can't disagree with what the video is actually doing.
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEventListener(player, 'statusChange', ({ error }) => {
    if (error) setFailed(true);
  });

  const togglePlay = useCallback(() => {
    if (player.playing) player.pause();
    else player.play();
  }, [player]);

  const loading = resolving || (!!sourceUri && status === 'loading' && !failed);
  const errored = failed || status === 'error' || unavailable;

  return (
    <View style={styles.root}>
      {sourceUri && !errored && (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          nativeControls={false}
        />
      )}

      {errored ? (
        <View style={styles.centre}>
          <VideoOff size={34} color={colors.textMuted} />
          <Text style={styles.errTitle}>This video won't play</Text>
          <Text style={styles.errBody}>It may still be uploading, or your connection dropped.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.errBtn}>
            <Text style={styles.errBtnTxt}>Go back</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={StyleSheet.absoluteFill} onPress={togglePlay} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
          {loading && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          )}
          {!loading && !isPlaying && (
            <View style={styles.overlay}>
              <View style={styles.playCircle}><Play size={28} color={colors.white} /></View>
            </View>
          )}
        </Pressable>
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Close" style={styles.closeBtn}>
          <X size={18} color={colors.white} />
        </Pressable>
        {(title || day != null) && (
          <View style={styles.meta}>
            {day != null && <Text style={styles.metaDay}>Day {day}</Text>}
            {title && <Text style={styles.metaTitle} numberOfLines={1}>{title}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.45)' },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1 },
  metaDay: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5 },
  metaTitle: { fontSize: 14.5, fontWeight: '600', color: colors.white, marginTop: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  errTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 19, color: colors.white, marginTop: 14, textAlign: 'center' },
  errBody: { fontSize: 14, color: colors.textMuted, marginTop: 8, lineHeight: 20, textAlign: 'center' },
  errBtn: { marginTop: 22, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  errBtnTxt: { fontSize: 15, fontWeight: '700', color: colors.white },
});
