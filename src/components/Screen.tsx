import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {SafeAreaView, type Edge} from 'react-native-safe-area-context';
import {colors} from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Defaults to ['top']. Pass [] to render no safe-area padding. */
  edges?: Edge[];
  /** Defaults to 720; the inner container caps at this width and centers on wider devices. */
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Standard screen frame: SafeAreaView with the brand background and a
 * centered, width-capped content column. Phones render edge-to-edge; tablets
 * get a tidy ~720dp column instead of stretching cards across 1000+dp.
 */
export const Screen: React.FC<Props> = ({
  children,
  edges = ['top'],
  maxWidth = 720,
  style,
  contentStyle,
}) => {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <View style={[styles.content, {maxWidth}, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});
