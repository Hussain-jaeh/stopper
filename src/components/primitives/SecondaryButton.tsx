import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, fonts, fontSizes, radii } from '../../theme/tokens';

interface SecondaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export function SecondaryButton({ children, onPress }: SecondaryButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.btn}>
      <Text style={styles.label}>{children}</Text>
      <View style={styles.circle}>
        <ChevronRight size={20} color={colors.white} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    paddingLeft: 28,
    paddingRight: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    alignSelf: 'flex-end',
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.button,
    fontWeight: '700',
    color: colors.black,
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
