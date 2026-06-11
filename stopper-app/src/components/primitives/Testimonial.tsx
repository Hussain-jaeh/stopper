import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { colors, fonts } from '../../theme/tokens';

interface TestimonialProps {
  initials: string;
  name: string;
  tint: string;
  title: string;
  quote: string;
}

export function Testimonial({ initials, name, tint, title, quote }: TestimonialProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: tint }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <BadgeCheck size={16} color={colors.jade400} />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.quote}>{quote}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initials: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 16,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  name: {
    fontFamily: fonts.ui,
    fontWeight: '700',
    fontSize: 15,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontFamily: fonts.ui,
    fontWeight: '700',
    fontSize: 15.5,
    color: colors.white,
    marginBottom: 6,
  },
  quote: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.fgMuted,
    lineHeight: 21,
  },
});
