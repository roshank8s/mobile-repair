import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle} from 'react-native-svg';
import {colors, radii, shadows} from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Tuple of two colours for the diagonal gradient. */
  colors?: [string, string];
  style?: StyleProp<ViewStyle>;
  /** Show the soft saffron decorative blobs. */
  decorate?: boolean;
};

/**
 * Premium hero card with a subtle diagonal gradient and optional decorative
 * blurred-circle accents. The default palette is the brand indigo→indigo-700
 * which matches the splash screen and More profile card.
 */
export const Hero: React.FC<Props> = ({
  children,
  colors: cs = ['#4338CA', '#1E1B4B'],
  style,
  decorate = true,
}) => {
  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient
        colors={cs}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      {decorate ? (
        <Svg
          height="100%"
          width="100%"
          viewBox="0 0 100 60"
          preserveAspectRatio="xMidYMid slice"
          style={StyleSheet.absoluteFill}>
          {/* Saffron glow top-right */}
          <Circle cx="92" cy="6" r="22" fill="#F59E0B" opacity={0.18} />
          {/* Indigo highlight bottom-left */}
          <Circle cx="6" cy="56" r="20" fill="#FFFFFF" opacity={0.06} />
          {/* Tiny accent dot */}
          <Circle cx="78" cy="40" r="3" fill="#F59E0B" opacity={0.4} />
        </Svg>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    ...shadows.raised,
  },
  content: {flex: 1},
});
