import React from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {fontSize, fontWeight} from '../theme/tokens';

type Props = {
  /** Data URI or remote URL. If absent, falls back to initials. */
  uri?: string | null;
  /** Two-character fallback if no image. */
  fallback?: string;
  /** Used to pick a deterministic gradient when there is no image. Defaults to fallback. */
  seed?: string;
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
  /** Override the auto-generated background. */
  background?: string;
  textColor?: string;
};

/**
 * Hashes a string to a stable hue between 0–359. Same name → same colour.
 * Used so each customer / technician gets a recognisable but distinct
 * gradient avatar even before they upload a photo.
 */
const hueFromString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 360;
};

const gradientForSeed = (seed: string): [string, string] => {
  const hue = hueFromString(seed);
  // Two stops: a saturated lighter top-left, a richer deeper bottom-right.
  const top = `hsl(${hue}, 78%, 64%)`;
  const bot = `hsl(${(hue + 24) % 360}, 70%, 44%)`;
  return [top, bot];
};

export const Avatar: React.FC<Props> = ({
  uri,
  fallback = '?',
  seed,
  size = 48,
  style,
  background,
  textColor = '#FFFFFF',
}) => {
  const radius = size / 2;
  const fontPx =
    size <= 32 ? fontSize.small : size <= 48 ? fontSize.bodyLg : fontSize.subhead;

  if (uri) {
    return (
      <Image
        source={{uri}}
        style={[
          {width: size, height: size, borderRadius: radius},
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  const initials = fallback.slice(0, 2).toUpperCase() || '?';
  const gradient = background
    ? ([background, background] as [string, string])
    : gradientForSeed(seed ?? fallback);

  return (
    <View
      style={[
        styles.fallback,
        {width: size, height: size, borderRadius: radius},
        style as StyleProp<ViewStyle>,
      ]}>
      <LinearGradient
        colors={gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          StyleSheet.absoluteFill,
          {borderRadius: radius},
        ]}
      />
      <Text style={[styles.text, {color: textColor, fontSize: fontPx}]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
});
