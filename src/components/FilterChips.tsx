import React from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {AnimatedPressable} from './AnimatedPressable';
import {colors, fontSize, fontWeight, radii, spacing} from '../theme/tokens';

export type FilterChip = {
  key: string;
  label: string;
  count?: number;
};

type Props = {
  chips: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
};

const formatLabel = (chip: FilterChip): string =>
  chip.count !== undefined && chip.count > 0
    ? `${chip.label} ${chip.count}`
    : chip.label;

export const FilterChips: React.FC<Props> = ({chips, activeKey, onChange}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}>
      {chips.map(chip => {
        const active = chip.key === activeKey;
        return (
          <AnimatedPressable
            key={chip.key}
            onPress={() => onChange(chip.key)}
            style={[styles.chip, active && styles.chipActive]}
            scaleTo={0.96}>
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}>
              {formatLabel(chip)}
            </Text>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  labelActive: {color: colors.textOnPrimary},
});
