import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
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

/**
 * Horizontal scrollable row of filter chips. The outer ScrollView gets
 * `flexGrow: 0` so it doesn't fill vertical space on tall layouts, and the
 * content container uses `alignItems: 'center'` so chips don't stretch
 * vertically into capsules when the parent flex container hands out extra
 * cross-axis size.
 */
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
            scaleTo={0.95}>
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}>
              {chip.label}
            </Text>
            {chip.count !== undefined && chip.count > 0 ? (
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text
                  style={[
                    styles.badgeText,
                    active && styles.badgeTextActive,
                  ]}>
                  {chip.count}
                </Text>
              </View>
            ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  labelActive: {color: colors.textOnAccent},
  badge: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {backgroundColor: 'rgba(0,0,0,0.18)'},
  badgeText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  badgeTextActive: {color: colors.textOnAccent},
});
