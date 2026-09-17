import React from 'react';
import { Keyboard, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

/**
 * Taps landing on empty space put the keyboard away, so finishing a field
 * doesn't require hunting for Return.
 *
 * Children keep their own touches — a Pressable only fires when no child
 * claimed the gesture — so buttons, inputs and scrolling all behave normally.
 * accessible={false} keeps it out of the VoiceOver order; it's a backstop for
 * stray taps, not a control.
 */
export function DismissKeyboard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable accessible={false} onPress={Keyboard.dismiss} style={[styles.fill, style]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
