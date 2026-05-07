import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {colors, radii, shadows, spacing} from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Optional 4px brand-color stripe on the left edge. */
  stripe?: boolean;
};

export const Hero: React.FC<Props> = ({children, style, stripe}) => {
  return (
    <View style={[styles.wrap, style]}>
      {stripe ? <View style={styles.stripe} /> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    flexDirection: 'row',
    ...shadows.card,
  },
  stripe: {
    width: 4,
    backgroundColor: colors.brand,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
});
