import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import Svg, {Circle, G, Path} from 'react-native-svg';
import {Button} from './Button';
import {colors, fontSize, fontWeight, spacing} from '../theme/tokens';

type IllustrationKind = 'jobs' | 'customers' | 'parts' | 'invoices' | 'generic';

type Props = {
  kind?: IllustrationKind;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState: React.FC<Props> = ({
  kind = 'generic',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(280).springify().damping(18)}
      style={styles.wrap}>
      <View style={styles.illustration}>
        <Illustration kind={kind} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="accent"
          style={{marginTop: spacing.lg}}
        />
      ) : null}
    </Animated.View>
  );
};

const Illustration: React.FC<{kind: IllustrationKind}> = ({kind}) => {
  return (
    <Svg width={140} height={140} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={56} fill={colors.cardMuted} />
      {kind === 'jobs' && (
        <G>
          <Path
            d="M40 50 H80 a4 4 0 0 1 4 4 v22 a4 4 0 0 1 -4 4 H40 a4 4 0 0 1 -4 -4 V54 a4 4 0 0 1 4 -4 z"
            fill={colors.card}
            stroke={colors.primary}
            strokeWidth={1.5}
          />
          <Path
            d="M48 46 v-4 a4 4 0 0 1 4 -4 h16 a4 4 0 0 1 4 4 v4"
            fill="none"
            stroke={colors.primary}
            strokeWidth={1.5}
          />
          <Path d="M44 64 H76" stroke={colors.accent} strokeWidth={2} />
        </G>
      )}
      {kind === 'customers' && (
        <G>
          <Circle cx={60} cy={50} r={10} fill={colors.primary} />
          <Path
            d="M40 84 q20 -16 40 0"
            fill={colors.primary}
            opacity={0.85}
          />
        </G>
      )}
      {kind === 'parts' && (
        <G>
          <Path
            d="M50 38 a6 6 0 1 1 12 0 v8 h6 v8 h-6 v8 a6 6 0 1 1 -12 0 v-8 h-6 v-8 h6 z"
            fill={colors.accent}
          />
        </G>
      )}
      {kind === 'invoices' && (
        <G>
          <Path
            d="M44 32 H72 l8 8 v44 a4 4 0 0 1 -4 4 H44 a4 4 0 0 1 -4 -4 V36 a4 4 0 0 1 4 -4 z"
            fill={colors.card}
            stroke={colors.primary}
            strokeWidth={1.5}
          />
          <Path d="M48 50 H72" stroke={colors.textMuted} strokeWidth={1.5} />
          <Path d="M48 60 H72" stroke={colors.textMuted} strokeWidth={1.5} />
          <Path d="M48 70 H64" stroke={colors.accent} strokeWidth={2} />
        </G>
      )}
      {kind === 'generic' && (
        <G>
          <Circle cx={60} cy={60} r={20} fill={colors.primary} opacity={0.15} />
          <Circle cx={60} cy={60} r={6} fill={colors.primary} />
        </G>
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  illustration: {marginBottom: spacing.lg},
  title: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.bold,
    color: colors.textOnBg,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.xs,
    fontSize: fontSize.small,
    color: colors.textOnBgMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
});
