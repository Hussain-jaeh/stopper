import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { BellRing } from 'lucide-react-native';
import { CircleBack, PrimaryButton, SkipLink, DotTexture } from '../../components/primitives';
import { colors, fonts } from '../../theme/tokens';

interface NotificationsScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export function NotificationsScreen({ onBack, onNext }: NotificationsScreenProps) {
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={{ zIndex: 1 }}>
        <CircleBack onBack={onBack} />
      </View>
      <View style={[styles.content, { zIndex: 1 }]}>
        <Animated.View style={{ transform: [{ scale: breathe }] }}>
          <BellRing size={52} color={colors.jade400} />
        </Animated.View>
        <Text style={styles.title}>Stay on track</Text>
        <Text style={styles.subtitle}>
          Gentle reminders and timely motivation so you never lose sight of your goals.
        </Text>
      </View>
      <View style={[styles.cta, { zIndex: 1 }]}>
        <PrimaryButton onPress={onNext}>Enable notifications</PrimaryButton>
        <SkipLink onPress={onNext}>Not now</SkipLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  title: { fontFamily: fonts.display, fontWeight: '800', fontSize: 28, color: colors.white, letterSpacing: -0.3, marginTop: 18, textAlign: 'center' },
  subtitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.fgMuted, lineHeight: 22, textAlign: 'center', marginHorizontal: 20, marginTop: 12 },
  cta: { alignItems: 'center', gap: 6, paddingTop: 10 },
});
