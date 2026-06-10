import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, fonts, radii } from '../../theme/tokens';

interface AuthFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secure?: boolean;          // password field with show/hide toggle
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  error?: string;
}

export function AuthField({
  label, value, onChangeText, placeholder, secure, keyboardType, autoFocus, error,
}: AuthFieldProps) {
  const [focused, setFocused] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);

  const borderColor = error ? colors.alert : focused ? colors.accent : colors.border;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, { borderColor }, focused && !error && styles.focusRing]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.fgFaint}
          secureTextEntry={secure && !reveal}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
        />
        {secure ? (
          <Pressable onPress={() => setReveal(r => !r)} hitSlop={8} style={styles.toggle}>
            {reveal
              ? <EyeOff size={18} color={colors.fgMuted} strokeWidth={2} />
              : <Eye size={18} color={colors.fgMuted} strokeWidth={2} />}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontFamily: fonts.ui, fontSize: 14, color: colors.fgMuted },
  field: {
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surface1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
  },
  focusRing: {
    // RN has no box-shadow ring; emulate with a subtle accent tint border already set.
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.white,
    fontFamily: fonts.ui,
    fontSize: 17,
  },
  toggle: { padding: 4 },
  error: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.coral400 },
});
