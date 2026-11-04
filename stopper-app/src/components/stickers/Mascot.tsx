import React from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';

/**
 * A mascot pose. Static by design: the idle animation was removed.
 * `mood` is kept so existing call sites don't change; it has no effect.
 */
export function Mascot({
  source, style, accessibilityLabel,
}: {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  mood?: 'idle' | 'cheer';
  accessibilityLabel?: string;
}) {
  return (
    <Image
      source={source}
      style={style}
      resizeMode="contain"
      accessibilityLabel={accessibilityLabel}
      accessibilityIgnoresInvertColors
    />
  );
}
