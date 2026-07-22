// Referral card — copy link + native invite. Drop into dashboard, profile, or
// the share sheet's footer.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Share2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { type as T } from '../../constants/typography';

export function InviteCard({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      const { setStringAsync } = require('expo-clipboard');
      await setStringAsync(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Expo Go — native module not in binary; long-press on URL text still works
    }
  };

  // Shares a full human-readable invite message (always opens share sheet).
  const sendInvite = () =>
    Share.share({ message: `I'm rebuilding my life with Stopper. Join me: ${inviteUrl}` });

  return (
    <LinearGradient
      colors={['rgba(20,184,136,0.16)', 'rgba(46,125,209,0.10)']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.head}>
        <View style={styles.icon}><UserPlus size={22} color={colors.onAccent} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Recover together</Text>
          <Text style={styles.sub}>Bring a friend — you're 2× more likely to stick with it.</Text>
        </View>
      </View>

      <View style={styles.linkRow}>
        {/* selectable so long-press → native copy also works */}
        <View style={styles.linkBox}>
          <Text selectable style={styles.linkTxt} numberOfLines={1}>
            {inviteUrl.replace(/^https?:\/\//, '')}
          </Text>
        </View>
        <Pressable
          onPress={copyLink}
          accessibilityLabel="Copy invite link"
          style={[styles.copyBtn, { backgroundColor: copied ? colors.jade600 : colors.jade500 }]}
        >
          <Text style={styles.copyTxt}>{copied ? 'Copied ✓' : 'Copy'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={sendInvite} style={styles.send} accessibilityLabel="Send invite">
        <Share2 size={18} color={colors.white} />
        <Text style={styles.sendTxt}>Send invite</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(20,184,136,0.3)' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.jade500, alignItems: 'center', justifyContent: 'center' },
  title: { ...T.h1, fontSize: 20, color: colors.white },
  sub: { fontSize: 13.5, color: colors.textMuted, marginTop: 2 },
  linkRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  linkBox: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 16, height: 48 },
  linkTxt: { fontSize: 15, color: colors.gray100, fontWeight: '600' },
  copyBtn: { height: 48, paddingHorizontal: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  copyTxt: { color: colors.onAccent, fontWeight: '800', fontSize: 14 },
  send: { height: 52, borderRadius: 26, marginTop: 10, backgroundColor: colors.ink900, borderWidth: 1, borderColor: colors.jade700, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  sendTxt: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
