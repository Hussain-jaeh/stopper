import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout, CloudOff, RotateCcw } from 'lucide-react-native';
import { colors, gradients } from '../../constants/colors';
import { radius, shadow } from '../../constants/spacing';
import { type } from '../../constants/typography';

function Skel({ h, w = '100%', r = 12 }: { h: number; w?: number | string; r?: number }) {
  return <View style={{ height: h, width: w as any, borderRadius: r, backgroundColor: colors.surface2, opacity: 0.6 }} />;
}

export function DashboardSkeleton() {
  return (
    <View style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, gap: 10 }}>
          <Skel h={14} w="40%" /><Skel h={24} w="55%" /><Skel h={13} w="70%" />
        </View>
        <Skel h={46} w={46} r={999} />
      </View>
      <Skel h={196} r={radius.hero} />
      <Skel h={104} r={radius.card} />
      <View style={{ flexDirection: 'row', gap: 12 }}><Skel h={104} r={radius.card} /><Skel h={104} r={radius.card} /></View>
      <View style={{ flexDirection: 'row', gap: 12 }}><Skel h={104} r={radius.card} /><Skel h={104} r={radius.card} /></View>
      <Skel h={86} r={radius.card} />
      <Skel h={60} r={radius.card} />
    </View>
  );
}

export function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.center}>
      <LinearGradient colors={[colors.jade400, colors.jade700]} style={styles.orb}>
        <Sprout size={42} color={colors.white} />
      </LinearGradient>
      <Text style={styles.title}>Let's start your{'\n'}recovery journey</Text>
      <Text style={styles.body}>Set up your profile to begin tracking your streak and progress.</Text>
      <Pressable onPress={onStart} accessibilityRole="button" style={[styles.cta, shadow.cta]}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaFill}>
          <Text style={styles.ctaText}>Get started</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <View style={styles.errIcon}><CloudOff size={38} color={colors.orange500} /></View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.body}>Pull down to try again, or tap below.</Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={styles.retry}>
        <RotateCcw size={18} color={colors.white} />
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  orb: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  errIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(242,98,46,0.12)', marginBottom: 16 },
  title: { ...type.h1, color: colors.white, textAlign: 'center' },
  body: { ...type.subtitle, color: colors.textMuted, textAlign: 'center', marginTop: 10, marginBottom: 22, lineHeight: 21 },
  cta: { width: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  ctaFill: { height: 56, alignItems: 'center', justifyContent: 'center' },
  ctaText: { ...type.button, color: colors.white, fontWeight: '700' },
  retry: { flexDirection: 'row', alignItems: 'center', gap: 9, height: 50, paddingHorizontal: 28, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface1 },
  retryText: { ...type.body, color: colors.white, fontWeight: '600' },
});
