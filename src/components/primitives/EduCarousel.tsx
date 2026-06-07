import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { colors, fonts, fontSizes } from '../../theme/tokens';

export interface EduSlide {
  icon: React.ReactNode;
  title: string;
  body: string;
  tint?: string;
}

interface EduCarouselProps {
  slides: EduSlide[];
  onDone: () => void;
}

export function EduCarousel({ slides, onDone }: EduCarouselProps) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <View style={styles.container}>
      {/* Segmented progress */}
      <View style={styles.segRow}>
        {slides.map((_, k) => (
          <View
            key={k}
            style={[styles.seg, k <= index && styles.segActive]}
          />
        ))}
      </View>

      {/* Slide content */}
      <View style={styles.slideContent}>
        <View style={[styles.orb, { backgroundColor: slide.tint || colors.jade500, shadowColor: slide.tint || colors.jade500 }]}>
          {slide.icon}
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, k) => (
          <View
            key={k}
            style={[
              styles.dot,
              {
                width: k === index ? 9 : 7,
                height: k === index ? 9 : 7,
                backgroundColor: k === index ? colors.white : 'rgba(255,255,255,0.28)',
              },
            ]}
          />
        ))}
      </View>

      <PrimaryButton onPress={() => (isLast ? onDone() : setIndex(index + 1))} icon={null}>
        {isLast ? 'Continue' : 'Next'}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  segRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.surface3,
  },
  segActive: {
    backgroundColor: colors.jade500,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: 4,
    paddingHorizontal: 24,
  },
  orb: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 27,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 6,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.body,
    color: colors.fgMuted,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 16,
    alignItems: 'center',
  },
  dot: {
    borderRadius: 999,
  },
});
