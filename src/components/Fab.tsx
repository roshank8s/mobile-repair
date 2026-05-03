import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AnimatedPressable} from './AnimatedPressable';
import {PlusIcon} from './icons';
import {colors, fontSize, fontWeight, motion, radii, shadows, spacing} from '../theme/tokens';

type Props = {
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export const Fab: React.FC<Props> = ({onPress, label, style}) => {
  const rot = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rot.value}deg`}],
  }));

  const isExtended = !!label;

  return (
    <View style={[styles.wrap, style]} pointerEvents="box-none">
      <AnimatedPressable
        onPress={() => {
          rot.value = withSpring(rot.value + 90, motion.springBouncy);
          onPress();
        }}
        style={[styles.fab, isExtended && styles.fabExtended]}
        scaleTo={0.94}>
        <Animated.View style={animStyle}>
          <PlusIcon size={isExtended ? 22 : 28} color={colors.textOnAccent} strokeWidth={2.6} />
        </Animated.View>
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  fabExtended: {
    width: 'auto',
    height: 56,
    borderRadius: radii.pill,
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  label: {
    color: colors.textOnAccent,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
});
