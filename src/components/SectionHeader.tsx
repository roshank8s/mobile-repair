import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {AnimatedPressable} from './AnimatedPressable';
import {ChevronRightIcon} from './icons';
import {colors, fontSize, fontWeight, spacing} from '../theme/tokens';

type Props = {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Section title row with an optional inline action ("See all", "Manage"...).
 * Used between hero / stat blocks and lists on the Dashboard and elsewhere.
 */
export const SectionHeader: React.FC<Props> = ({
  title,
  caption,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.flex}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <AnimatedPressable
          onPress={onAction}
          style={styles.action}
          scaleTo={0.95}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <ChevronRightIcon size={14} color={colors.primary} strokeWidth={2.4} />
        </AnimatedPressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  flex: {flex: 1},
  title: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  caption: {
    fontSize: fontSize.caption,
    color: colors.textSubtle,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
  },
  actionLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.2,
  },
});
