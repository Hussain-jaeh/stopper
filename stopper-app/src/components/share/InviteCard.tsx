// Referral card — copy link + native invite. Drop into dashboard, profile, or
// the share sheet's footer.
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Share2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { type as T } from '../../constants/typography';

export function InviteCard({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!requireOptionalNativeModule('ExpoClipboard')) return;
    try {
      const { setStringAsync } = require('expo-clipboard');
      await setStringAsync(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  // One tap opens the iOS share sheet (Messages, WhatsApp, etc.) with a
  // ready-to-send message; the link rides inside it instead of being the UI.
  const sendInvite = () =>
    Share.share({
      message: `I'm quitting a bad habit with Stopper and I'd like you with me. Download it here: ${inviteUrl}`,
    }).catch(() => {});

  return (
    <Pressable onPress={sendInvite} accessibilityRole="button" accessibilityLabel="Invite a friend">
      <LinearGradient
        colors={['rgba(20,184,136,0.16)', 'rgba(46,125,209,0.10)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.head}>
          <View style={styles.icon}><UserPlus size={22} color={colors.onAccent} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Recover with a friend</Text>
            <Text style={styles.sub}>People who quit with someone are more likely to stick with it.</Text>
          </View>
        </View>

        <View style={styles.send}>
          <Share2 size={18} color={colors.onAccent} />
          <Text style={styles.sendTxt}>Invite a friend</Text>
        </View>

        <Pressable onPress={copyLink} hitSlop={10} accessibilityLabel="Copy invite link" style={styles.copyRow}>
          <Text style={styles.copyTxt}>{copied ? 'Link copied' : 'Copy link instead'}</Text>
        </Pressable>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(20,184,136,0.3)' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.jade500, alignItems: 'center', justifyContent: 'center' },
  title: { ...T.h1, fontSize: 20, color: colors.white },
  sub: { fontSize: 13.5, color: colors.textMuted, marginTop: 2 },
  send: { height: 52, borderRadius: 14, marginTop: 18, backgroundColor: colors.jade500, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  sendTxt: { color: colors.onAccent, fontSize: 16, fontWeight: '800' },
  copyRow: { alignSelf: 'center', marginTop: 12 },
  copyTxt: { color: colors.textMuted, fontSize: 13.5, fontWeight: '600' },
});
