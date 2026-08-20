import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Video, PenLine, Trash2 } from 'lucide-react-native';
import { useQuery, useMutation } from 'convex/react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { VaultThumb } from '../components/vault/VaultThumb';
import { Recording } from '../components/vault/FutureYouCard';
import { colors, gradients } from '../constants/colors';
import { spacing, radius, shadow } from '../constants/spacing';
import { type } from '../constants/typography';
import { RootStackParamList } from '../navigation/TabNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function VaultScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const recordings = useQuery(api.vault.listRecordings) as Recording[] | undefined;
  const rename = useMutation(api.vault.renameRecording);
  const remove = useMutation(api.vault.deleteRecording);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const confirmDelete = (r: Recording) =>
    Alert.alert('Delete this message?', `"${r.title}" from day ${r.day} will be gone forever.`, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove({ id: r.id as any }) },
    ]);

  const renderItem = ({ item, index }: { item: Recording; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(500)} style={styles.row}>
      <VaultThumb day={item.day} thumbUri={item.thumbUri} size={62} radius={12}
        onPress={() => navigation.navigate('VaultPlay', { uri: item.videoUri ?? '', title: item.title, day: item.day })} />
      <View style={{ flex: 1, minWidth: 0 }}>
        {editingId === item.id ? (
          <TextInput
            autoFocus value={draft} onChangeText={setDraft}
            onBlur={() => { setEditingId(null); if (draft.trim()) rename({ id: item.id as any, title: draft.trim() }); }}
            onSubmitEditing={() => { setEditingId(null); if (draft.trim()) rename({ id: item.id as any, title: draft.trim() }); }}
            style={styles.titleInput}
          />
        ) : (
          <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        )}
        <Text style={styles.rowMeta}>Day {item.day} · {item.date} · {item.duration}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Pressable onPress={() => { setEditingId(item.id); setDraft(item.title); }} accessibilityLabel="Rename" style={styles.iconBtn}><PenLine size={16} color={colors.textMuted} /></Pressable>
        <Pressable onPress={() => confirmDelete(item)} accessibilityLabel="Delete" style={styles.iconBtn}><Trash2 size={16} color={colors.textFaint} /></Pressable>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <ChevronLeft size={20} color={colors.white} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Memory Vault</Text>
          <Text style={styles.sub}>Private messages from your past self. Only you can see these.</Text>
        </View>
      </View>

      <FlatList
        data={recordings ?? []}
        keyExtractor={r => r.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: spacing.screenPad, paddingBottom: insets.bottom + 110, gap: 12, paddingTop: 20 }}
        ListEmptyComponent={recordings === undefined ? null : (
          <View style={styles.empty}>
            <Video size={34} color={colors.jade400} />
            <Text style={styles.emptyTitle}>Your vault is empty</Text>
            <Text style={styles.emptyBody}>Record a message today. Future you will be glad you did.</Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable onPress={() => navigation.navigate('VaultRecord')} accessibilityRole="button" style={shadow.cta}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            <Video size={19} color={colors.onAccent} />
            <Text style={styles.ctaTxt}>Record a new message</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.screenPad },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  h1: { ...type.h1, fontSize: 24, color: colors.white },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 3, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 14 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.white },
  rowMeta: { fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  titleInput: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.jade500, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7, color: colors.white, fontSize: 14.5, fontWeight: '600' },
  iconBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 38, paddingHorizontal: 22, backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card },
  emptyTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 19, color: colors.white, marginTop: 14 },
  emptyBody: { fontSize: 14, color: colors.textMuted, marginTop: 8, lineHeight: 20, textAlign: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.screenPad, paddingTop: 12, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
  cta: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  ctaTxt: { fontSize: 15.5, fontWeight: '800', color: colors.onAccent },
});
