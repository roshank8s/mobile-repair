import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AnimatedPressable} from './AnimatedPressable';
import {PlusIcon} from './icons';
import {colors, motion, shadows, spacing} from '../theme/tokens';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const Fab: React.FC<Props> = ({onPress, style}) => {
  const rot = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rot.value}deg`}],
  }));

  return (
    <View style={[styles.wrap, style]} pointerEvents="box-none">
      <AnimatedPressable
        onPress={() => {
          rot.value = withSpring(rot.value + 90, motion.springBouncy);
          onPress();
        }}
        style={styles.fab}
        scaleTo={0.92}>
        <Animated.View style={animStyle}>
          <PlusIcon size={28} color={colors.textOnAccent} strokeWidth={2.6} />
        </Animated.View>
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
});
