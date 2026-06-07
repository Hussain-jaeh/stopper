import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Brain, BatteryLow, HeartCrack, Sprout } from 'lucide-react-native';
import { DotTexture, EduCarousel, EduSlide } from '../../components/primitives';
import { colors } from '../../theme/tokens';

const SLIDES: EduSlide[] = [
  {
    icon: <Brain size={58} color="#fff" strokeWidth={2} />,
    tint: '#9B6FE4',
    title: 'Habits hijack your brain',
    body: "Every quick hit floods your brain with dopamine. Over time it takes more just to feel normal — that's the loop we'll break.",
  },
  {
    icon: <BatteryLow size={58} color="#fff" strokeWidth={2} />,
    tint: '#2E7DD1',
    title: 'Why you feel drained',
    body: "A spiked dopamine baseline is why so many people feel unmotivated, foggy and low. It's not you — it's the cycle.",
  },
  {
    icon: <HeartCrack size={58} color="#fff" strokeWidth={2} />,
    tint: '#F2622E',
    title: 'It costs more than time',
    body: 'Left unchecked, these habits quietly erode focus, relationships and confidence. Naming it is the first step to taking it back.',
  },
  {
    icon: <Sprout size={58} color="#fff" strokeWidth={2} />,
    tint: '#14B888',
    title: 'Your brain can reset',
    body: 'Recovery is real. With consistency, your brain rewires — restoring drive, clarity and calm. Stopper guides every step.',
  },
];

interface EducationScreenProps {
  onNext: () => void;
}

export function EducationScreen({ onNext }: EducationScreenProps) {
  return (
    <View style={styles.screen}>
      <DotTexture />
      <EduCarousel slides={SLIDES} onDone={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
});
