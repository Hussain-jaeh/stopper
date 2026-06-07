import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, radii } from '../../theme/tokens';

interface StopperTextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function StopperTextInput({ label, value, onChangeText, placeholder }: StopperTextInputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.fgFaint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.fgMuted,
  },
  input: {
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surface1,
    paddingHorizontal: 18,
    color: colors.white,
    fontFamily: fonts.ui,
    fontSize: 17,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
});
