import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Pencil } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { type } from '../../constants/typography';

type Props = {
  name: string;
  pseudonym: string;
  joined: string;
  onEdit?: () => void;
  index?: number;
};

export function ProfileHeader({ name, pseudonym, joined, onEdit, index = 0 }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.wrap}>
      <Pressable onPress={onEdit} accessibilityRole="button" accessibilityLabel="Edit profile" style={styles.avatarWrap}>
        <LinearGradient colors={[colors.jade400, colors.jade700]} start={{ x: 0.38, y: 0.32 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.avatarTxt}>{name.slice(0, 1).toUpperCase()}</Text>
        </LinearGradient>
        <View style={styles.editBadge}><Pencil size={14} color={colors.jade300} /></View>
      </Pressable>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.pseudonym}>@{pseudonym}</Text>
        <View style={styles.dot} />
        <Text style={styles.meta}>Member since {joined}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 6 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 34, color: colors.white },
  editBadge: { position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  name: { ...type.h1, fontSize: 25, color: colors.white, marginTop: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 },
  pseudonym: { fontSize: 13.5, color: colors.jade300, fontWeight: '600' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textFaint },
  meta: { fontSize: 13.5, color: colors.textMuted },
});
