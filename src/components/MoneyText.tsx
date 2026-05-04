import React, {useEffect} from 'react';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {formatINR} from '../lib/currency';
import {colors, fontSize, fontWeight, motion} from '../theme/tokens';
import {isReduceMotionEnabled} from '../lib/haptics';

type Props = {
  value: number;
  style?: StyleProp<TextStyle>;
  showDecimals?: boolean;
  symbol?: boolean;
  animate?: boolean;
  durationMs?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export const MoneyText: React.FC<Props> = ({
  value,
  style,
  showDecimals,
  symbol = true,
  animate = true,
  durationMs = motion.slow,
  size = 'md',
}) => {
  const animVal = useSharedValue(0);
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    if (!animate || isReduceMotionEnabled()) {
      animVal.value = value;
      setDisplay(value);
      return;
    }
    animVal.value = withTiming(value, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, animate, durationMs, animVal]);

  useAnimatedReaction(
    () => animVal.value,
    v => {
      runOnJS(setDisplay)(v);
    },
    [],
  );

  return (
    <View>
      <Text
        style={[
          styles.base,
          SIZE_STYLES[size],
          {fontVariant: ['tabular-nums']},
          style,
        ]}>
        {formatINR(display, {showDecimals, symbol})}
      </Text>
    </View>
  );
};

const SIZE_STYLES: Record<NonNullable<Props['size']>, TextStyle> = {
  sm: {fontSize: fontSize.body, fontWeight: fontWeight.semibold},
  md: {fontSize: fontSize.subhead, fontWeight: fontWeight.bold},
  lg: {fontSize: fontSize.title, fontWeight: fontWeight.bold},
  xl: {fontSize: fontSize.hero, fontWeight: fontWeight.black},
};

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
});
