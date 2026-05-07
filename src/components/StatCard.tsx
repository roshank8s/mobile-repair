import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors, fontSize, fontWeight, spacing} from '../theme/tokens';
import {MoneyText} from './MoneyText';

type Props = {
  label: string;
  value: number;
  asMoney?: boolean;
  /** Reserved for future trend rendering. */
  accent?: string;
  delay?: number;
  hint?: string;
  style?: StyleProp<ViewStyle>;
};

export const StatCard: React.FC<Props> = ({
  label,
  value,
  asMoney,
  hint,
  style,
}) => {
  return (
    <View style={[styles.cell, style]}>
      <Text style={styles.label}>{label}</Text>
      {asMoney ? (
        <MoneyText value={value} size="lg" />
      ) : (
        <Text style={styles.bigValue}>{value}</Text>
      )}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  label: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  bigValue: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    marginTop: 2,
  },
});
