import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontSize, fontWeight, radii, spacing} from '../theme/tokens';
import {JOB_STATUS_LABEL, JobStatus} from '../data/types';

type Variant = 'active' | 'done' | 'cancelled';

const STATUS_VARIANT: Record<JobStatus, Variant> = {
  received: 'active',
  diagnosed: 'active',
  quoted: 'active',
  approved: 'active',
  in_progress: 'active',
  ready: 'active',
  delivered: 'done',
  cancelled: 'cancelled',
};

const VARIANT_STYLE: Record<Variant, {bg: string; fg: string}> = {
  active: {bg: colors.brandSoft, fg: colors.brand},
  done: {bg: colors.primaryMuted, fg: colors.primaryRaised},
  cancelled: {bg: colors.dangerSoft, fg: colors.danger},
};

type Props = {
  status: JobStatus;
  size?: 'sm' | 'md';
};

export const StatusPill: React.FC<Props> = ({status, size = 'md'}) => {
  const v = VARIANT_STYLE[STATUS_VARIANT[status]];
  return (
    <View
      style={[
        styles.pill,
        {backgroundColor: v.bg},
        size === 'sm' ? styles.pillSm : null,
      ]}>
      <Text style={[styles.label, {color: v.fg}, size === 'sm' && styles.labelSm]}>
        {JOB_STATUS_LABEL[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  pillSm: {paddingHorizontal: spacing.sm, paddingVertical: 3},
  label: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.1,
  },
  labelSm: {
    fontSize: fontSize.caption,
  },
});
