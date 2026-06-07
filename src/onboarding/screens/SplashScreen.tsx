import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wordmark, Laurel } from '../../components/primitives';
import { fonts } from '../../theme/tokens';
import styled from 'styled-components/native';

const Tagline = styled.Text`
  font-family: ${fonts.ui};
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
`;

interface SplashScreenProps {
  onNext: () => void;
}

export function SplashScreen({ onNext }: SplashScreenProps) {
  return (
    <Pressable style={styles.fill} onPress={onNext}>
      <LinearGradient
        colors={['#11A074', '#0B6B4D', '#053A2B']}
        locations={[0, 0.46, 1]}
        style={styles.fill}
      >
        <Wordmark size={56} />
        <Tagline>Embrace this pause.</Tagline>
        <Laurel size={22} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
});
