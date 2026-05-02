import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {colors, fontSize, fontWeight, radii, shadows, spacing} from '../theme/tokens';
import {MoneyText} from './MoneyText';

type Props = {
  label: string;
  value: number;
  asMoney?: boolean;
  accent?: string;
  delay?: number;
  hint?: string;
  style?: StyleProp<ViewStyle>;
};

export const StatCard: React.FC<Props> = ({
  label,
  value,
  asMoney,
  accent = colors.accent,
  delay = 0,
  hint,
  style,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(360).delay(delay).springify().damping(18)}
      style={[styles.card, style]}>
      <View style={[styles.bar, {backgroundColor: accent}]} />
      <Text style={styles.label}>{label}</Text>
      {asMoney ? (
        <MoneyText value={value} size="lg" />
      ) : (
        <Text style={styles.bigValue}>{value}</Text>
      )}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 110,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadows.card,
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  label: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
  },
  bigValue: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    marginTop: 2,
  },
});
