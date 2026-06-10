import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { colors, gradients, fonts, fontSizes, radii, shadows } from '../../theme/tokens';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode | null;
  style?: ViewStyle;
}

export function PrimaryButton({ children, onPress, disabled, loading, icon, style }: PrimaryButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const isDisabled = disabled || loading;
  const showIcon = !loading && (icon === undefined ? true : icon !== null);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.wrapper,
        { opacity: isDisabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.975 : 1 }] },
        style,
      ]}
    >
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <>
              <Text style={styles.label}>{children}</Text>
              {showIcon && (icon || <ArrowRight size={20} color={colors.white} strokeWidth={2} />)}
            </>
        }
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: radii.pill,
    ...shadows.glowCta,
  },
  gradient: {
    height: 56,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: fontSizes.button,
    fontWeight: '600',
    letterSpacing: 0.16,
    color: colors.white,
  },
});
