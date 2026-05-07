import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AnimatedPressable} from './AnimatedPressable';
import {colors, fontSize, fontWeight, spacing} from '../theme/tokens';
import {ChevronLeftIcon} from './icons';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export const ScreenHeader: React.FC<Props> = ({
  title,
  subtitle,
  onBack,
  right,
}) => {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <AnimatedPressable onPress={onBack} style={styles.back}>
          <ChevronLeftIcon size={22} color={colors.text} />
        </AnimatedPressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.titles}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  spacer: {width: 40, height: 40},
  titles: {flex: 1},
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {minWidth: 40, alignItems: 'flex-end'},
});
