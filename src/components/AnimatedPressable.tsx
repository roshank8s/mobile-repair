import React, {useCallback} from 'react';
import {Pressable, PressableProps, ViewStyle, StyleProp} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {tap as hapticTap, isReduceMotionEnabled} from '../lib/haptics';
import {motion} from '../theme/tokens';

const APressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  withHaptic?: boolean;
  children: React.ReactNode;
};

export const AnimatedPressable: React.FC<Props> = ({
  style,
  scaleTo = 0.97,
  withHaptic = true,
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(
    (e: any) => {
      if (!isReduceMotionEnabled()) {
        scale.value = withSpring(scaleTo, motion.spring);
        opacity.value = withTiming(0.9, {duration: 80});
      }
      onPressIn?.(e);
    },
    [onPressIn, scale, opacity, scaleTo],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      if (!isReduceMotionEnabled()) {
        scale.value = withSpring(1, motion.springSoft);
        opacity.value = withTiming(1, {duration: 120});
      }
      if (withHaptic) hapticTap();
      onPressOut?.(e);
    },
    [onPressOut, withHaptic, scale, opacity],
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <APressable
      {...rest}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animStyle, style]}>
      {children}
    </APressable>
  );
};
