import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {colors, fontSize, fontWeight, motion, radii, spacing} from '../theme/tokens';
import {JOB_STATUS_LABEL, JobStatus} from '../data/types';
import {isReduceMotionEnabled} from '../lib/haptics';

const STATUS_COLOR: Record<
  JobStatus,
  {bg: string; fg: string; dot: string}
> = {
  received: {bg: colors.infoSoft, fg: colors.info, dot: colors.info},
  diagnosed: {bg: colors.infoSoft, fg: colors.info, dot: colors.info},
  quoted: {bg: colors.warningSoft, fg: '#92400E', dot: colors.warning},
  approved: {bg: colors.warningSoft, fg: '#92400E', dot: colors.warning},
  in_progress: {bg: colors.warningSoft, fg: '#92400E', dot: colors.warning},
  ready: {bg: colors.successSoft, fg: '#166534', dot: colors.success},
  delivered: {bg: '#EEF2FF', fg: colors.primary, dot: colors.primary},
  cancelled: {bg: colors.dangerSoft, fg: colors.danger, dot: colors.danger},
};

type Props = {
  status: JobStatus;
  size?: 'sm' | 'md';
};

export const StatusPill: React.FC<Props> = ({status, size = 'md'}) => {
  const c = STATUS_COLOR[status];
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isReduceMotionEnabled()) return;
    scale.value = withSequence(
      withTiming(1.06, {duration: 90}),
      withSpring(1, motion.springBouncy),
    );
  }, [status, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.View
      style={[
        styles.pill,
        {backgroundColor: c.bg},
        size === 'sm' ? styles.pillSm : null,
        animStyle,
      ]}>
      <View style={[styles.dot, {backgroundColor: c.dot}]} />
      <Text style={[styles.label, {color: c.fg}, size === 'sm' && styles.labelSm]}>
        {JOB_STATUS_LABEL[status]}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  pillSm: {paddingHorizontal: spacing.sm, paddingVertical: 4},
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: fontSize.caption,
  },
});
