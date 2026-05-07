import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {SafeAreaView, type Edge} from 'react-native-safe-area-context';
import {colors} from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Defaults to ['top']. Pass [] to render no safe-area padding. */
  edges?: Edge[];
  /**
   * Cap the inner column width. Defaults to undefined (full width). Set to
   * a smaller number (e.g. 560) for form screens so inputs don't sprawl.
   */
  maxContentWidth?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export const Screen: React.FC<Props> = ({
  children,
  edges = ['top'],
  maxContentWidth,
  style,
  contentStyle,
}) => {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <View
        style={[
          styles.content,
          maxContentWidth ? {maxWidth: maxContentWidth} : null,
          contentStyle,
        ]}>
        {children}
      </View>
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
