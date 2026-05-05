import React, {useEffect} from 'react';
import {Image, StatusBar, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const RISHI_CARD = require('../assets/brand/rishi22-card.jpg');

type Props = {
  visible: boolean;
  onFinished?: () => void;
};

/**
 * JS-side splash overlay that exactly mirrors the native splash drawable:
 * the Rishi22 card stretched to fill every pixel of the screen, no
 * background colour behind it. Fades out once the app is ready.
 */
export const SplashOverlay: React.FC<Props> = ({visible, onFinished}) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      scale.value = withTiming(1.02, {duration: 280});
      opacity.value = withDelay(
        80,
        withTiming(0, {duration: 320, easing: Easing.out(Easing.ease)}, fin => {
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

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[StyleSheet.absoluteFill, styles.wrap, wrapStyle]}>
      {/* Translucent system bars so the image extends to the very top
          and bottom of the screen during splash. */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Image
        source={RISHI_CARD}
        style={StyleSheet.absoluteFill}
        resizeMode="stretch"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    zIndex: 1000,
    // No background colour — the Image fills every pixel itself.
  },
});

