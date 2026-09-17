// components/stickers/Sticker.tsx
// Gradient-disc icon treatment. Renders a Lucide glyph on a tone-gradient disc with
// specular sheen, rim light and outer glow. Replaces every emoji in the app.
import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { STICKER_TONES, resolveSize, type StickerTone, type StickerSize } from './stickerTokens';
import { GLYPHS, type StickerKey } from './iconMap';

type Props = {
  /** semantic key from iconMap — preferred. */
  name?: StickerKey;
  /** or pass a glyph directly. */
  Icon?: any;
  tone?: StickerTone;
  size?: StickerSize;
  state?: 'on' | 'off' | 'locked';
  shape?: 'disc' | 'squircle';
  diecut?: boolean;
  strokeWidth?: number;
  style?: ViewStyle;
};

export function Sticker({
  name, Icon, tone, size = 'md', state = 'on',
  shape = 'disc', diecut = false, strokeWidth = 2.1, style,
}: Props) {
  const px = resolveSize(size);
  const entry = name ? GLYPHS[name] : undefined;
  const Glyph = Icon ?? (entry ? entry[0] : Lock);
  const t: StickerTone = tone ?? ((entry ? entry[1] : 'jade') as StickerTone);
  const [light, deep, glow] = STICKER_TONES[t];
  const radius = shape === 'squircle' ? Math.round(px * 0.3) : px / 2;
  const glyphSize = Math.round(px * 0.46);

  const base: ViewStyle = {
    width: px, height: px, borderRadius: radius,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    ...style,
  };

  if (state === 'locked') {
    return (
      <View style={[base, { backgroundColor: '#1E1E1E', borderWidth: 1.5, borderColor: '#3E4644', borderStyle: 'dashed', opacity: 0.85 }]}>
        <Lock size={Math.round(px * 0.34)} color="#5A5A5A" strokeWidth={2.2} />
      </View>
    );
  }
  if (state === 'off') {
    return (
      <View style={[base, { backgroundColor: 'rgba(255,255,255,0.055)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' }]}>
        <Glyph size={glyphSize} color="#8A8A8A" strokeWidth={strokeWidth} />
      </View>
    );
  }

  return (
    <View style={[
      base,
      {
        // RN can't do inset shadows — the sheen + rim overlays below stand in for them.
        shadowColor: glow, shadowOpacity: 1, shadowRadius: px * 0.34,
        shadowOffset: { width: 0, height: px * 0.12 }, elevation: 6,
        borderWidth: diecut ? Math.max(2, px * 0.035) : 0,
        borderColor: 'rgba(255,255,255,0.92)',
      },
    ]}>
      <LinearGradient
        colors={[light, deep]}
        start={{ x: 0.22, y: 0.14 }} end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* rim light along the top edge */}
      <View pointerEvents="none" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: Math.max(1.5, px * 0.03),
        backgroundColor: 'rgba(255,255,255,0.42)',
      }} />
      {/* specular sheen, upper-left */}
      <View pointerEvents="none" style={{
        position: 'absolute', top: -px * 0.18, left: -px * 0.12,
        width: px * 0.76, height: px * 0.62, borderRadius: px * 0.38,
        backgroundColor: 'rgba(255,255,255,0.20)',
      }} />
      <Glyph size={glyphSize} color="#fff" strokeWidth={strokeWidth} />
    </View>
  );
}
