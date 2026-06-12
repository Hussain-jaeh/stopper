import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Camera } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { type } from '../../constants/typography';

type Props = {
  name: string;
  tagline: string;
  avatarUri?: string;
  onEditAvatar?: () => void;
  index?: number;
};

export function ProfileIdentity({ name, tagline, avatarUri, onEditAvatar, index = 1 }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(550)} style={styles.wrap}>
      <Pressable onPress={onEditAvatar} accessibilityRole="button" accessibilityLabel="Change photo" style={styles.ring}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.initial}>{name.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.camBadge}><Camera size={13} color={colors.jade300} /></View>
      </Pressable>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 38, marginBottom: 44 },
  ring: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2,
          shadowColor: colors.jade500, shadowOpacity: 0.35, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, borderWidth: 4, borderColor: 'rgba(20,184,136,0.25)' },
  avatar: { width: 104, height: 104, borderRadius: 52 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface3 },
  initial: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 38, color: colors.jade300 },
  camBadge: { position: 'absolute', bottom: 0, right: 4, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  name: { ...type.h1, fontSize: 26, color: colors.white, marginTop: 20 },
  tagline: { fontSize: 15, color: colors.jade300, fontWeight: '500', marginTop: 10 },
});
