import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {AnimatedPressable} from './AnimatedPressable';
import {colors, fontSize, fontWeight, spacing} from '../theme/tokens';

type Props = {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

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
          scaleTo={0.96}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
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
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  caption: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  action: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
});
