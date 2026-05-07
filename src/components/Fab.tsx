import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {AnimatedPressable} from './AnimatedPressable';
import {PlusIcon} from './icons';
import {colors, fontSize, fontWeight, radii, shadows, spacing} from '../theme/tokens';

type Props = {
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export const Fab: React.FC<Props> = ({onPress, label, style}) => {
  const isExtended = !!label;
  return (
    <View style={[styles.wrap, style]} pointerEvents="box-none">
      <AnimatedPressable
        onPress={onPress}
        style={[styles.fab, isExtended && styles.fabExtended]}
        scaleTo={0.94}>
        <PlusIcon
          size={isExtended ? 20 : 24}
          color={colors.textOnAccent}
          strokeWidth={2.2}
        />
        {isExtended ? <Text style={styles.label}>{label}</Text> : null}
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.raised,
  },
  fabExtended: {
    width: 'auto',
    height: 52,
    borderRadius: radii.pill,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    color: colors.textOnAccent,
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
});
