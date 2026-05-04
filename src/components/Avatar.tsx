import React from 'react';
import {Image, ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors, fontSize, fontWeight} from '../theme/tokens';

type Props = {
  /** Data URI or remote URL. If absent, falls back to initials. */
  uri?: string | null;
  /** Two-character fallback if no image. */
  fallback?: string;
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
  background?: string;
  textColor?: string;
};

export const Avatar: React.FC<Props> = ({
  uri,
  fallback = '?',
  size = 48,
  style,
  background = colors.primaryMuted,
  textColor = colors.primary,
}) => {
  const radius = size / 2;
  const fontPx = size <= 32 ? fontSize.small : size <= 48 ? fontSize.bodyLg : fontSize.subhead;

  if (uri) {
    return (
      <Image
        source={{uri}}
        style={[
          {width: size, height: size, borderRadius: radius, backgroundColor: background},
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {width: size, height: size, borderRadius: radius, backgroundColor: background},
        style as StyleProp<ViewStyle>,
      ]}>
      <Text style={[styles.text, {color: textColor, fontSize: fontPx}]}>
        {fallback.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
});
