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
import {fontSize, fontWeight} from '../theme/tokens';

type Props = {
  uri?: string | null;
  fallback?: string;
  seed?: string;
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
  background?: string;
  textColor?: string;
};

const EARTH_TONES = [
  '#7C5E48',
  '#5D6E58',
  '#4F5765',
  '#7A4F4F',
  '#9C7A4A',
  '#536872',
];

const indexFromString = (s: string, mod: number): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
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
  const bg =
    background ?? EARTH_TONES[indexFromString(seed ?? fallback, EARTH_TONES.length)];

  return (
    <View
      style={[
        styles.fallback,
        {width: size, height: size, borderRadius: radius, backgroundColor: bg},
        style as StyleProp<ViewStyle>,
      ]}>
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
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
  },
});
