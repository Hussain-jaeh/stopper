// The off-screen graphic captured to an image. Render inside a ViewShot ref,
// then capture at the format's pixel size for a crisp export.
import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cardContent, ShareCardType, ShareFormat, ShareData, FORMAT_SIZE } from '../../lib/shareCard';

export function ShareCardView({
  type, format, d, showHabit, scale = 0.32, winPhotoUri,
}: {
  type: ShareCardType;
  format: ShareFormat;
  d: ShareData;
  showHabit: boolean;
  scale?: number;
  winPhotoUri?: string;
}) {
  const { w, h } = FORMAT_SIZE[format];
  const square = format === 'square';
  const s = (n: number) => n * scale;

  // ── Win card — user photo background with streak overlay ──────────────────
  if (type === 'win' && winPhotoUri) {
    return (
      <View style={{ width: s(w), height: s(h), borderRadius: s(square ? 44 : 56), overflow: 'hidden', backgroundColor: '#000' }}>
        <Image
          source={{ uri: winPhotoUri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          resizeMode="cover"
        />
        {/* dark scrim over bottom portion */}
        <LinearGradient
          colors={['transparent', 'rgba(4,32,26,0.88)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: s(square ? 580 : 860) }}
        />
        {/* text overlay */}
        <View style={{ position: 'absolute', bottom: s(square ? 110 : 170), left: 0, right: 0, alignItems: 'center', paddingHorizontal: s(80) }}>
          <Text style={{ fontSize: s(30), letterSpacing: s(5), fontWeight: '800', color: 'rgba(255,255,255,0.82)' }}>MY WIN 💪</Text>
          <Text style={{ fontFamily: fontDisplay, fontWeight: '800', color: '#fff', textAlign: 'center',
            fontSize: s(square ? 260 : 320), letterSpacing: s(-8),
            lineHeight: s(square ? 270 : 330), marginTop: s(6) }}>{d.days}</Text>
          <Text style={{ fontSize: s(square ? 56 : 68), fontWeight: '800', color: '#fff' }}>days free</Text>
          {showHabit && (
            <Text style={{ fontSize: s(square ? 34 : 42), fontWeight: '600', color: 'rgba(255,255,255,0.72)', marginTop: s(10) }}>
              {d.habit}-free
            </Text>
          )}
        </View>
        <BrandLockup s={s} square={square} />
      </View>
    );
  }

  // ── Standard gradient cards (streak / money / stats / win placeholder) ────
  const c = cardContent(type, d, showHabit);
  return (
    <LinearGradient
      colors={['#14B888', '#0b6b4d', '#05231b']} locations={[0, 0.34, 0.85]}
      start={{ x: 0.5, y: -0.06 }} end={{ x: 0.5, y: 0.85 }}
      style={{ width: s(w), height: s(h), borderRadius: s(square ? 44 : 56), overflow: 'hidden' }}
    >
      {/* glow */}
      <View style={{ position: 'absolute', left: '50%', top: '30%', width: s(760), height: s(760),
        marginLeft: -s(380), marginTop: -s(380), borderRadius: s(380), backgroundColor: 'rgba(255,255,255,0.14)' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: square ? 'center' : 'flex-start',
        paddingHorizontal: s(90), paddingTop: square ? 0 : s(150) }}>
        <Text style={{ fontSize: s(38), letterSpacing: s(6), fontWeight: '800', color: 'rgba(4,32,26,0.7)' }}>{c.kicker}</Text>
        <Text style={{ fontSize: s(square ? 150 : 170), marginTop: s(square ? 10 : 30), lineHeight: s(square ? 160 : 180) }}>{c.glyph}</Text>
        <Text style={{ fontFamily: fontDisplay, fontWeight: '800', color: '#fff', textAlign: 'center',
          fontSize: s(type === 'streak' || type === 'win' ? (square ? 300 : 340) : (square ? 150 : 190)),
          letterSpacing: s(-6), marginTop: s(square ? 8 : 24) }}>{c.big}</Text>
        <Text style={{ fontSize: s(square ? 52 : 62), fontWeight: '800', color: '#fff', marginTop: s(4) }}>{c.unit}</Text>
        <Text style={{ fontSize: s(square ? 36 : 44), fontWeight: '600', color: 'rgba(4,32,26,0.72)', marginTop: s(square ? 18 : 40), textAlign: 'center' }}>{c.sub}</Text>
      </View>
      <BrandLockup s={s} square={square} />
    </LinearGradient>
  );
}

function BrandLockup({ s, square }: { s: (n: number) => number; square: boolean }) {
  return (
    <View style={{ position: 'absolute', bottom: s(square ? 46 : 90), left: 0, right: 0,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(16) }}>
      <View style={{ width: s(58), height: s(58), borderRadius: s(29), backgroundColor: '#04201A',
        alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fontDisplay, fontWeight: '800', color: '#fff', fontSize: s(26) }}>S</Text>
      </View>
      <Text style={{ fontFamily: fontDisplay, fontWeight: '800', color: '#fff', fontSize: s(44), letterSpacing: s(-1) }}>Stopper</Text>
    </View>
  );
}

const fontDisplay = 'BricolageGrotesque_800ExtraBold';
