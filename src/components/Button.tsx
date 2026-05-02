import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {AnimatedPressable} from './AnimatedPressable';
import {colors, fontSize, fontWeight, radii, spacing} from '../theme/tokens';

type Variant = 'primary' | 'accent' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
};

export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  leftIcon,
  rightIcon,
  style,
  fullWidth,
}) => {
  const sizeStyle = SIZE_STYLES[size];
  const v = VARIANT_STYLES[variant];
  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      style={[
        styles.btn,
        sizeStyle.container,
        v.container,
        fullWidth && styles.full,
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={v.label.color as string} />
        ) : (
          <>
            {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
            <Text style={[styles.label, sizeStyle.label, v.label]}>
              {label}
            </Text>
            {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
};

const SIZE_STYLES = {
  sm: {
    container: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minHeight: 36,
      borderRadius: radii.md,
    },
    label: {fontSize: fontSize.small, fontWeight: fontWeight.semibold},
  },
  md: {
    container: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      minHeight: 44,
      borderRadius: radii.md,
    },
    label: {fontSize: fontSize.body, fontWeight: fontWeight.semibold},
  },
  lg: {
    container: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      minHeight: 54,
      borderRadius: radii.lg,
    },
    label: {fontSize: fontSize.bodyLg, fontWeight: fontWeight.bold},
  },
} as const;

const VARIANT_STYLES = {
  primary: {
    container: {backgroundColor: colors.primary},
    label: {color: colors.textOnPrimary},
  },
  accent: {
    container: {backgroundColor: colors.accent},
    label: {color: colors.textOnAccent},
  },
  ghost: {
    container: {backgroundColor: 'transparent'},
    label: {color: colors.primary},
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {color: colors.text},
  },
  danger: {
    container: {backgroundColor: colors.danger},
    label: {color: colors.textOnPrimary},
  },
} as const;

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  full: {alignSelf: 'stretch'},
  row: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  icon: {alignItems: 'center', justifyContent: 'center'},
  label: {textAlign: 'center'},
  disabled: {opacity: 0.5},
});
