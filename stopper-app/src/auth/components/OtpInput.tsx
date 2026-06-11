import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../../theme/tokens';

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
}

/** 6-cell one-time-code input with auto-advance and backspace handling. */
export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const refs = React.useRef<Array<TextInput | null>>([]);

  const setDigit = (i: number, ch: string) => {
    const digit = ch.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = digit;
    const next = arr.join('').slice(0, length);
    onChange(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, key: string) => {
    if (key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i];
        return (
          <TextInput
            key={i}
            ref={el => { refs.current[i] = el; }}
            value={value[i] || ''}
            onChangeText={ch => setDigit(i, ch)}
            onKeyPress={e => onKey(i, e.nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            style={[styles.cell, { borderColor: filled ? colors.accent : colors.border }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  cell: {
    width: 46,
    height: 58,
    borderRadius: radii.lg,
    backgroundColor: colors.surface1,
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 24,
    borderWidth: 1.5,
  },
});
