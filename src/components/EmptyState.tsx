import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {Button} from './Button';
import {colors, fontSize, fontWeight, spacing} from '../theme/tokens';

type IllustrationKind = 'jobs' | 'customers' | 'parts' | 'invoices' | 'generic';

type Props = {
  kind?: IllustrationKind;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState: React.FC<Props> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      style={styles.wrap}>
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {actionLabel && onAction ? (
          <Button
            label={actionLabel}
            onPress={onAction}
            variant="ghost"
            style={styles.action}
          />
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  inner: {
    alignItems: 'center',
    maxWidth: 360,
  },
  title: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  action: {marginTop: spacing.lg},
});
