import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, fontSizes, gradients } from '../../theme/tokens';

interface SegmentCardProps {
  icon: React.ReactNode;
  title: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}

export function SegmentCard({ icon, title, sub, selected, onPress }: SegmentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      {selected ? (
        <LinearGradient
          colors={['#14B888', '#2DD4A0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrap}
        >
          {icon}
        </LinearGradient>
      ) : (
        <View style={styles.iconWrapUnsel}>{icon}</View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface1,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cardSelected: {
    backgroundColor: 'rgba(20,184,136,0.12)',
    borderColor: colors.jade500,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapUnsel: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.button,
    fontWeight: '700',
    color: colors.white,
  },
  sub: {
    fontFamily: fonts.ui,
    fontSize: 13.5,
    color: colors.fgMuted,
    marginTop: 3,
    lineHeight: 18,
  },
});
