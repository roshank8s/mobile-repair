import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {colors, radii, shadows, spacing} from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  bordered?: boolean;
  raised?: boolean;
};

export const Card: React.FC<Props> = ({
  children,
  style,
  padded = true,
  bordered = true,
  raised,
}) => {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        bordered && styles.bordered,
        raised ? shadows.raised : shadows.card,
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
  },
  padded: {padding: spacing.lg},
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
