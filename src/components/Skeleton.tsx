import React, {useEffect} from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {colors, radii} from '../theme/tokens';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export const Skeleton: React.FC<Props> = ({
  width = '100%',
  height = 14,
  radius = radii.sm,
  style,
}) => {
  const v = useSharedValue(0.4);

  useEffect(() => {
    v.value = withRepeat(
      withTiming(1, {duration: 900, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [v]);

  const animStyle = useAnimatedStyle(() => ({opacity: v.value}));

  return (
    <Animated.View
      style={[
        styles.box,
        {width: width as any, height, borderRadius: radius},
        animStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.cardMuted,
  },
});
