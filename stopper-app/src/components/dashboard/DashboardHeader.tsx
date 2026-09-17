import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { type } from '../../constants/typography';

function greetingFor(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardHeader({ name, avatarUri, onShare, index = 0 }: { name: string; avatarUri?: string | null; onShare?: () => void; index?: number }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>{greetingFor()},</Text>
        <Text style={styles.name} accessibilityRole="header">{name} 👋</Text>
        <Text style={styles.sub}>Keep going. You're making progress.</Text>
      </View>
      {onShare && (
        <Pressable
          onPress={onShare}
          hitSlop={10}
          style={styles.shareBtn}
          accessibilityRole="button"
          accessibilityLabel="Share my progress"
        >
          <Share2 size={18} color={colors.jade300} />
        </Pressable>
      )}
      <View style={styles.avatar}>
        {avatarUri
          ? <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
          : <Text style={styles.avatarTxt}>{name.slice(0, 1).toUpperCase()}</Text>
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  greeting: { ...type.subtitle, color: colors.textMuted, fontWeight: '500' },
  name: { ...type.h1, color: colors.white, marginTop: 3 },
  sub: { ...type.label, color: colors.textMuted, marginTop: 8 },
  shareBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  avatarImg: { width: 46, height: 46, borderRadius: 23 },
  avatarTxt: { ...type.cardTitle, color: colors.jade300 },
});
