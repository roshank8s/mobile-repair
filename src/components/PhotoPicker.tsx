import React, {useState} from 'react';
import {Alert, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {AnimatedPressable} from './AnimatedPressable';
import {Avatar} from './Avatar';
import {CameraIcon, PencilIcon, TrashIcon} from './icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../theme/tokens';
import {choosePhoto} from '../lib/imagePicker';
import {tap as hapticTap} from '../lib/haptics';

type Props = {
  uri?: string | null;
  fallback?: string;
  size?: number;
  label?: string;
  shape?: 'circle' | 'rounded';
  background?: string;
  textColor?: string;
  onChange: (dataUri: string | null) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Single-photo picker. Shows the existing image (or initials) with a small
 * pencil overlay; tap to replace, long-press to remove.
 */
export const PhotoPicker: React.FC<Props> = ({
  uri,
  fallback = '+',
  size = 88,
  label,
  shape = 'circle',
  background,
  textColor,
  onChange,
  style,
}) => {
  const [busy, setBusy] = useState(false);

  const onPick = async () => {
    if (busy) return;
    setBusy(true);
    hapticTap();
    const picked = await choosePhoto();
    setBusy(false);
    if (picked) onChange(picked.dataUri);
  };

  const onClear = () => {
    if (!uri) return;
    Alert.alert('Remove photo?', undefined, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: () => onChange(null)},
    ]);
  };

  const radius = shape === 'circle' ? size / 2 : radii.lg;

  return (
    <View style={[styles.wrap, style]}>
      <View>
        <AnimatedPressable
          onPress={onPick}
          onLongPress={onClear}
          scaleTo={0.95}
          style={{borderRadius: radius}}>
          <Avatar
            uri={uri}
            fallback={fallback}
            size={size}
            background={background}
            textColor={textColor}
            style={{borderRadius: radius}}
          />
          <View
            style={[
              styles.editBadge,
              {borderRadius: 14, right: -2, bottom: -2},
            ]}>
            {uri ? (
              <PencilIcon size={14} color={colors.textOnPrimary} />
            ) : (
              <CameraIcon size={14} color={colors.textOnPrimary} strokeWidth={2.4} />
            )}
          </View>
        </AnimatedPressable>
        {uri ? (
          <AnimatedPressable
            onPress={onClear}
            scaleTo={0.92}
            style={styles.removeBadge}>
            <TrashIcon size={14} color={colors.danger} />
          </AnimatedPressable>
        ) : null}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', gap: spacing.sm},
  editBadge: {
    position: 'absolute',
    width: 28,
    height: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  removeBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  label: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
  },
});
