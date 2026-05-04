import React, {useEffect} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {colors, fontSize, fontWeight, radii, shadows, spacing} from '../theme/tokens';
import {isReduceMotionEnabled} from '../lib/haptics';

const RISHI_CARD = require('../assets/brand/rishi22-card.jpg');

const AUTO_DISMISS_MS = 2400;

type Props = {
  onFinished: () => void;
};

/**
 * Brand intro slide shown immediately after the native splash. Displays
 * the Rishi22 shop card image, holds for ~2.4 s (or until tapped), then
 * fades and slides up to reveal the app.
 */
export const BrandIntro: React.FC<Props> = ({onFinished}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const cardScale = useSharedValue(0.96);
  const cardOpacity = useSharedValue(0);
  const dismissedRef = React.useRef(false);

  const dismiss = React.useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    if (isReduceMotionEnabled()) {
      opacity.value = 0;
      runOnJS(onFinished)();
      return;
    }
    translateY.value = withTiming(-40, {
      duration: 360,
      easing: Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(
      0,
      {duration: 320, easing: Easing.in(Easing.cubic)},
      finished => {
        'worklet';
        if (finished) runOnJS(onFinished)();
      },
    );
  }, [translateY, opacity, onFinished]);

  useEffect(() => {
    if (isReduceMotionEnabled()) {
      cardScale.value = 1;
      cardOpacity.value = 1;
    } else {
      cardOpacity.value = withTiming(1, {duration: 320});
      cardScale.value = withSequence(
        withTiming(1.02, {duration: 280, easing: Easing.out(Easing.cubic)}),
        withTiming(1, {duration: 200, easing: Easing.inOut(Easing.cubic)}),
      );
    }
    const t = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [cardOpacity, cardScale, dismiss]);

  // Subtle saffron pulse on the "Tap to continue" hint
  const hintOpacity = useSharedValue(0);
  useEffect(() => {
    hintOpacity.value = withDelay(700, withTiming(1, {duration: 300}));
  }, [hintOpacity]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{scale: cardScale.value}],
  }));

  const hintStyle = useAnimatedStyle(() => ({opacity: hintOpacity.value}));

  return (
    <Animated.View
      pointerEvents="auto"
      style={[StyleSheet.absoluteFill, styles.wrap, wrapStyle]}>
      <LinearGradient
        colors={['#0B0A1F', '#1E1B4B', '#0B0A1F']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <Pressable style={styles.flex} onPress={dismiss}>
        <View style={styles.center}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Image source={RISHI_CARD} style={styles.cardImage} resizeMode="contain" />
            <View style={styles.cardGlow} pointerEvents="none" />
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(280).delay(160)}
            style={styles.captionWrap}>
            <Text style={styles.welcome}>Welcome to</Text>
            <Text style={styles.brand}>Rishi22</Text>
            <Text style={styles.subtitle}>
              All Smart Watches, Earpods & Smart Phone Repair
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.hint, hintStyle]}>
          <View style={styles.hintDot} />
          <Text style={styles.hintText}>Tap anywhere to continue</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#0B0A1F',
    zIndex: 900,
  },
  flex: {flex: 1},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    aspectRatio: 1.62,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: 'rgba(245,158,11,0.45)',
    ...shadows.raised,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  captionWrap: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: 4,
  },
  welcome: {
    fontSize: fontSize.small,
    color: '#C7D2FE',
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  brand: {
    fontSize: 38,
    fontWeight: fontWeight.black,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: '#E0E7FF',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.huge,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  hintText: {
    color: '#A5B4FC',
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
