import React from 'react';
import { View, StyleSheet } from 'react-native';

export function DotTexture() {
  // React Native doesn't support CSS background-image dot patterns natively.
  // This renders a subtle dark overlay approximation.
  // For production, replace with a pre-rendered asset or SVG pattern.
  return <View style={styles.overlay} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
    backgroundColor: 'transparent',
  },
});
