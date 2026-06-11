import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

export function OrDivider({ label = 'or' }: { label?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: colors.borderStrong },
  label: { fontFamily: fonts.ui, fontSize: 13, color: colors.fgFaint },
});
