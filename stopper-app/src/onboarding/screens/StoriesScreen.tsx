import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CircleBack, Testimonial, PrimaryButton, DotTexture } from '../../components/primitives';
import { colors, fonts } from '../../theme/tokens';

interface StoriesScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export function StoriesScreen({ onBack, onNext }: StoriesScreenProps) {
  return (
    <View style={styles.screen}>
      <DotTexture />
      <View style={styles.topBar}>
        <CircleBack onBack={onBack} />
        <Text style={styles.topTitle}>Real stories</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Testimonial
          initials="DK"
          name="Daniel K."
          tint="#2E7DD1"
          title="90 days free — and clear-headed"
          quote="I tried quitting alone for years. The daily check-ins and seeing my streak grow finally made it stick."
        />
        <Testimonial
          initials="MA"
          name="Maya A."
          tint="#FF6B4A"
          title="I got my focus back"
          quote="The trigger insights were scarily accurate. I catch myself now before I spiral. Life-changing."
        />
        <Testimonial
          initials="JR"
          name="Jordan R."
          tint="#14B888"
          title="The streak card is everything"
          quote="Watching that number climb is more motivating than I expected. I don't want to reset it to zero."
        />
      </ScrollView>
      <View style={styles.cta}>
        <PrimaryButton onPress={onNext}>Continue</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.display, fontWeight: '700', fontSize: 22, color: colors.white },
  list: { flex: 1, zIndex: 1 },
  listContent: { gap: 20, paddingTop: 16, paddingBottom: 8 },
  cta: { paddingTop: 10 },
});
