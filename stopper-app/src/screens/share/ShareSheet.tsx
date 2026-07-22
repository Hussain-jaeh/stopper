// Card-type picker (streak/money/stats/win) · live preview · format toggle (story/square)
// · per-share privacy toggle · Share / Save image / Copy link.
import React, { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Share, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Share2, Download, Copy, Eye, EyeOff, Flame, PiggyBank, ChartLine, Trophy, ImagePlus } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { type as T } from '../../constants/typography';
import { ShareCardView } from '../../components/share/ShareCardView';
import { ShareData, ShareCardType, ShareFormat, FORMAT_SIZE } from '../../lib/shareCard';
import { RootStackParamList } from '../../navigation/TabNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ShareSheet'>;

const TYPES: { id: ShareCardType; label: string; Icon: any }[] = [
  { id: 'streak', label: 'Streak', Icon: Flame },
  { id: 'money',  label: 'Money',  Icon: PiggyBank },
  { id: 'stats',  label: 'Stats',  Icon: ChartLine },
  { id: 'win',    label: 'My win', Icon: Trophy },
];

// Preview dimensions (scaled-down, matches scale props below)
const PREVIEW_W = { story: 173, square: 302 };
const PREVIEW_H = { story: 307, square: 302 };

export function ShareSheet() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { shareUrl, ...shareData } = params;
  const d: ShareData = shareData;

  const [type, setType] = useState<ShareCardType>('streak');
  const [format, setFormat] = useState<ShareFormat>('story');
  const [showHabit, setShowHabit] = useState(false);
  const [winPhotoUri, setWinPhotoUri] = useState<string | null>(null);
  const shotRef = useRef<View>(null);
  const insets = useSafeAreaInsets();

  const canCapture = type !== 'win' || !!winPhotoUri;

  async function pickWinPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Allow photo access to add your win photo.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: format === 'story' ? [9, 16] : [1, 1],
      quality: 0.92,
    });
    if (!result.canceled) setWinPhotoUri(result.assets[0].uri);
  }

  async function capture(): Promise<string> {
    const { w, h } = FORMAT_SIZE[format];
    const { captureRef } = require('react-native-view-shot');
    return await captureRef(shotRef, { result: 'tmpfile', format: 'png', quality: 1, width: w, height: h });
  }
  async function onShare() {
    if (!canCapture) { Alert.alert('Add a photo first to share your win.'); return; }
    try {
      const uri = await capture();
      try {
        const Sharing = require('expo-sharing');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your progress' });
          return;
        }
      } catch {}
      await Share.share({ url: uri, message: `${d.days} days free with Stopper — ${shareUrl}` });
    } catch { /* user cancelled or unsupported */ }
  }
  async function onSave() {
    if (!canCapture) { Alert.alert('Add a photo first to save your win.'); return; }
    try {
      const MediaLibrary = require('expo-media-library');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Allow photo access to save your card.'); return; }
      const uri = await capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved to Photos');
    } catch { Alert.alert('Could not save image'); }
  }
  async function onCopy() {
    try {
      const { setStringAsync } = require('expo-clipboard');
      await setStringAsync(shareUrl);
      Alert.alert('Link copied');
    } catch {
      Alert.alert('Could not copy link');
    }
  }

  const previewW = PREVIEW_W[format];
  const previewH = PREVIEW_H[format];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.screenPad, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 48 }}>
      <View style={styles.nav}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityLabel="Back">
          <ChevronLeft size={20} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>Share your progress</Text>
      </View>

      {/* card type — 4 tabs in 2×2 grid */}
      <View style={styles.typeGrid}>
        {TYPES.map(({ id, label, Icon }) => {
          const on = type === id;
          return (
            <Pressable key={id} onPress={() => setType(id)}
              accessibilityRole="radio" accessibilityState={{ selected: on }}
              style={[styles.typeBtn, { backgroundColor: on ? colors.jade500 : colors.surface2, borderColor: on ? 'transparent' : colors.border }]}>
              <Icon size={15} color={on ? colors.onAccent : colors.textMuted} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: on ? colors.onAccent : colors.textMuted }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* live preview */}
      <View style={{ alignItems: 'center', marginVertical: 22 }}>
        {type === 'win' && !winPhotoUri ? (
          /* Photo placeholder — tappable, not captured */
          <Pressable onPress={pickWinPhoto}
            style={[styles.photoPicker, { width: previewW, height: previewH }]}
            accessibilityLabel="Add win photo">
            <View style={styles.photoIconWrap}>
              <ImagePlus size={28} color={colors.jade300} />
            </View>
            <Text style={styles.photoTitle}>Add your win photo</Text>
            <Text style={styles.photoSub}>gym · healthy meal{'\n'}anything you're proud of</Text>
          </Pressable>
        ) : (
          <View ref={shotRef} style={{ borderRadius: 20, overflow: 'hidden' }}>
            <ShareCardView
              type={type} format={format} d={d} showHabit={showHabit}
              scale={format === 'story' ? 0.16 : 0.28}
              winPhotoUri={winPhotoUri ?? undefined}
            />
          </View>
        )}

        {/* change photo button shown below a selected photo */}
        {type === 'win' && winPhotoUri && (
          <Pressable onPress={pickWinPhoto} style={styles.changePhoto}>
            <ImagePlus size={14} color={colors.jade300} />
            <Text style={styles.changePhotoTxt}>Change photo</Text>
          </Pressable>
        )}
      </View>

      {/* format */}
      <View style={styles.segment}>
        {(['story', 'square'] as ShareFormat[]).map(k => {
          const on = format === k;
          return (
            <Pressable key={k} onPress={() => setFormat(k)}
              accessibilityRole="radio" accessibilityState={{ selected: on }}
              style={[styles.segItem, { backgroundColor: on ? colors.jade500 : 'transparent' }]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: on ? colors.onAccent : colors.textMuted }}>
                {k === 'story' ? 'Story · 9:16' : 'Post · 1:1'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* privacy — hidden for win cards (photo speaks for itself) */}
      {type !== 'win' && (
        <View style={styles.privacy}>
          <View style={styles.pIcon}>
            {showHabit ? <Eye size={19} color={colors.jade300} /> : <EyeOff size={19} color={colors.jade300} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pTitle}>Show what I quit</Text>
            <Text style={styles.pSub}>{showHabit ? `Card reads "${d.habit}-free"` : 'Card stays private — just "free"'}</Text>
          </View>
          <Pressable onPress={() => setShowHabit(v => !v)}
            accessibilityRole="switch" accessibilityState={{ checked: showHabit }}
            accessibilityLabel="Show what I quit"
            style={[styles.toggle, { backgroundColor: showHabit ? colors.jade500 : colors.surface3 }]}>
            <View style={[styles.knob, { left: showHabit ? 22 : 3 }]} />
          </Pressable>
        </View>
      )}

      {/* actions */}
      <Pressable onPress={onShare} accessibilityLabel="Share"
        style={{ marginTop: 18, opacity: canCapture ? 1 : 0.45 }}>
        <LinearGradient colors={['#14B888', '#2DD4A0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
          <Share2 size={20} color={colors.onAccent} /><Text style={styles.ctaTxt}>Share</Text>
        </LinearGradient>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Pressable onPress={onSave} accessibilityLabel="Save image"
          style={[styles.sec, { opacity: canCapture ? 1 : 0.45 }]}>
          <Download size={18} color={colors.white} /><Text style={styles.secTxt}>Save image</Text>
        </Pressable>
        <Pressable onPress={onCopy} accessibilityLabel="Copy link" style={styles.sec}>
          <Copy size={18} color={colors.white} /><Text style={styles.secTxt}>Copy link</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 6 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { ...T.h1, fontSize: 22, color: colors.white },

  // 4-tab grid: two rows of two
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  typeBtn: { flexBasis: '48%', flexGrow: 1, height: 44, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },

  // photo placeholder
  photoPicker: { borderRadius: 20, backgroundColor: colors.surface1, borderWidth: 1.5, borderColor: 'rgba(20,184,136,0.35)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 10 },
  photoIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(20,184,136,0.15)', alignItems: 'center', justifyContent: 'center' },
  photoTitle: { fontSize: 16, fontWeight: '800', color: colors.white },
  photoSub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 },
  changePhoto: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, padding: 8 },
  changePhotoTxt: { fontSize: 13, fontWeight: '700', color: colors.jade300 },

  segment: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 4 },
  segItem: { flex: 1, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginTop: 12 },
  pIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(20,184,136,0.15)', alignItems: 'center', justifyContent: 'center' },
  pTitle: { fontSize: 15, fontWeight: '700', color: colors.white },
  pSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  toggle: { width: 48, height: 29, borderRadius: 999 },
  knob: { position: 'absolute', top: 3, width: 23, height: 23, borderRadius: 12, backgroundColor: '#fff' },
  cta: { height: 56, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaTxt: { color: colors.onAccent, fontSize: 17, fontWeight: '800' },
  sec: { flex: 1, height: 50, borderRadius: 25, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secTxt: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
