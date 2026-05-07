import React, {useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import {colors, fontSize, fontWeight, radii, spacing} from '../theme/tokens';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  rightAdornment?: React.ReactNode;
  leftAdornment?: React.ReactNode;
};

export const Input: React.FC<Props> = ({
  label,
  error,
  hint,
  containerStyle,
  rightAdornment,
  leftAdornment,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          error ? styles.inputRowError : null,
        ]}>
        {leftAdornment ? (
          <View style={styles.adornL}>{leftAdornment}</View>
        ) : null}
        <TextInput
          {...rest}
          placeholderTextColor={colors.textSubtle}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, rest.style]}
        />
        {rightAdornment ? (
          <View style={styles.adornR}>{rightAdornment}</View>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {gap: spacing.xs},
  label: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputRowFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.body,
    paddingVertical: spacing.sm,
  },
  adornL: {marginRight: spacing.sm},
  adornR: {marginLeft: spacing.sm},
  error: {fontSize: fontSize.small, color: colors.danger},
  hint: {fontSize: fontSize.small, color: colors.textSubtle},
});
