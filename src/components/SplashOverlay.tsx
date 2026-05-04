import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Circle, G, Path} from 'react-native-svg';
import {colors} from '../theme/tokens';

type Props = {
  visible: boolean;
  onFinished?: () => void;
};

/**
 * JS-side splash overlay that exactly matches the native splash drawable
 * (indigo background + saffron wrench mark). This continues to cover the
 * UI while React boots the rest of the app, then fades out smoothly.
 */
export const SplashOverlay: React.FC<Props> = ({visible, onFinished}) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, {duration: 800, easing: Easing.out(Easing.ease)}),
        withTiming(0.3, {duration: 800, easing: Easing.in(Easing.ease)}),
      ),
      -1,
      true,
    );
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.15, {duration: 800, easing: Easing.out(Easing.ease)}),
        withTiming(1, {duration: 800, easing: Easing.in(Easing.ease)}),
      ),
      -1,
      true,
    );
  }, [ringOpacity, ringScale]);

  useEffect(() => {
    if (!visible) {
      scale.value = withTiming(1.04, {duration: 250});
      opacity.value = withDelay(
        80,
        withTiming(0, {duration: 280, easing: Easing.out(Easing.ease)}, fin => {
          'worklet';
          if (fin && onFinished) runOnJS(onFinished)();
        }),
      );
    }
  }, [visible, opacity, scale, onFinished]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{scale: ringScale.value}],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, styles.wrap, wrapStyle]}>
      <View style={styles.center}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Logo />
      </View>
    </Animated.View>
  );
};

const Logo: React.FC = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120">
    <G>
      <Circle cx={60} cy={60} r={42} fill="#312E81" opacity={0.4} />
      <Path
        d="M82.5 33.5
           a14 14 0 0 0 -16.6 16.6
           L40.5 75.5
           a8 8 0 0 0 0 11.3
           l2.7 2.7
           a8 8 0 0 0 11.3 0
           L79.9 64.1
           a14 14 0 0 0 16.6 -16.6
           l-7.6 7.6
           a4 4 0 0 1 -5.7 0
           l-3.5 -3.5
           a4 4 0 0 1 0 -5.7 z"
        fill={colors.accent}
      />
      <Path
        d="M44 30 L48 38 L56 42 L48 46 L44 54 L40 46 L32 42 L40 38 Z"
        fill="#FFFFFF"
      />
    </G>
  </Svg>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  center: {alignItems: 'center', justifyContent: 'center'},
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
});
