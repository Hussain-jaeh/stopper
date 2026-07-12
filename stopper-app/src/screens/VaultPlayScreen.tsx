import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { X, Play } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { RootStackParamList } from '../navigation/TabNavigator';

type Route = RouteProp<RootStackParamList, 'VaultPlay'>;

export function VaultPlayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { params } = useRoute<Route>();
  const { uri, title, day } = params;

  const player = useVideoPlayer(uri, (p) => { p.play(); });

  const togglePlay = useCallback(() => {
    if (player.playing) player.pause();
    else player.play();
  }, [player]);

  return (
    <View style={styles.root}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
      />

      <Pressable style={StyleSheet.absoluteFill} onPress={togglePlay}>
        {!player.playing && (
          <View style={styles.playOverlay}>
            <View style={styles.playCircle}><Play size={28} color={colors.white} /></View>
          </View>
        )}
      </Pressable>

      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Close" style={styles.closeBtn}>
          <X size={18} color={colors.white} />
        </Pressable>
        {(title || day) && (
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
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.45)' },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1 },
  metaDay: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5 },
  metaTitle: { fontSize: 14.5, fontWeight: '600', color: colors.white, marginTop: 1 },
  playOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
});
