import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {colors} from '../theme/tokens';

const RISHI_CARD = require('../assets/brand/rishi22-card.jpg');

type Props = {
  visible: boolean;
  onFinished?: () => void;
};

/**
 * JS-side splash overlay that exactly mirrors the native splash drawable
 * (Rishi22 card centred on black). It continues to cover the UI while
 * React boots, then fades out once the app is ready.
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
      <View style={styles.cardWrap}>
        <Image source={RISHI_CARD} style={styles.card} resizeMode="contain" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  cardWrap: {
    width: '85%',
    maxWidth: 380,
    aspectRatio: 0.706,
  },
  card: {
    width: '100%',
    height: '100%',
  },
});
