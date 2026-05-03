import React, {useState} from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {FadeIn, FadeOut, ZoomIn} from 'react-native-reanimated';
import {AnimatedPressable} from './AnimatedPressable';
import {CameraIcon, ImageIcon, PlusIcon, XIcon} from './icons';
import {colors, fontSize, fontWeight, radii, spacing} from '../theme/tokens';
import {pickFromCamera, pickFromGallery} from '../lib/imagePicker';
import {tap as hapticTap} from '../lib/haptics';

type Props = {
  photos: string[];
  onAdd: (dataUri: string) => void;
  onRemove: (index: number) => void;
  emptyHint?: string;
  /** Limit total photos. 0 = unlimited. */
  max?: number;
};

const TILE = 88;

/**
 * Multi-photo grid (used for device-condition photos on a job ticket).
 * Tap a tile to view full-screen; tap the + tile for camera/gallery sheet;
 * long-press an existing tile to remove.
 */
export const PhotoGallery: React.FC<Props> = ({
  photos,
  onAdd,
  onRemove,
  emptyHint,
  max = 6,
}) => {
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const {width: winWidth} = useWindowDimensions();
  const atMax = max > 0 && photos.length >= max;

  const handleAdd = (source: 'camera' | 'gallery') => async () => {
    hapticTap();
    const picker = source === 'camera' ? pickFromCamera : pickFromGallery;
    const picked = await picker();
    if (picked) onAdd(picked.dataUri);
  };

  const handleRemove = (index: number) => () => {
    Alert.alert('Remove photo?', undefined, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: () => onRemove(index)},
    ]);
  };

  return (
    <View>
      <View style={styles.row}>
        {photos.map((uri, i) => (
          <AnimatedPressable
            key={`${i}-${uri.slice(-12)}`}
            onPress={() => setPreviewIdx(i)}
            onLongPress={handleRemove(i)}
            scaleTo={0.95}
            style={styles.tile}>
            <Image source={{uri}} style={styles.tileImg} />
          </AnimatedPressable>
        ))}

        {!atMax ? (
          <View style={styles.addCol}>
            <AnimatedPressable
              onPress={handleAdd('camera')}
              scaleTo={0.94}
              style={[styles.addTile, {marginBottom: spacing.xs}]}>
              <CameraIcon size={20} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.addLabel}>Camera</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={handleAdd('gallery')}
              scaleTo={0.94}
              style={styles.addTileMuted}>
              <ImageIcon size={18} color={colors.textMuted} strokeWidth={2.2} />
              <Text style={[styles.addLabel, {color: colors.textMuted}]}>Gallery</Text>
            </AnimatedPressable>
          </View>
        ) : null}
      </View>

      {photos.length === 0 && emptyHint ? (
        <Text style={styles.emptyHint}>{emptyHint}</Text>
      ) : null}

      <Modal
        visible={previewIdx !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewIdx(null)}>
        {previewIdx !== null ? (
          <Animated.View
            entering={FadeIn.duration(160)}
            exiting={FadeOut.duration(120)}
            style={styles.previewBackdrop}>
            <Animated.View entering={ZoomIn.duration(220).springify()} style={styles.previewWrap}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentOffset={{x: previewIdx * winWidth, y: 0}}>
                {photos.map((uri, i) => (
                  <Image
                    key={`p-${i}`}
                    source={{uri}}
                    style={[styles.previewImg, {width: winWidth}]}
                    resizeMode="contain"
                  />
                ))}
              </ScrollView>
            </Animated.View>

            <View style={styles.previewBar}>
              <Text style={styles.previewCount}>
                Photo {previewIdx + 1} of {photos.length}
              </Text>
              <View style={styles.previewActions}>
                <AnimatedPressable
                  onPress={() => {
                    Alert.alert('Remove photo?', undefined, [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                          const idx = previewIdx;
                          setPreviewIdx(null);
                          onRemove(idx);
                        },
                      },
                    ]);
                  }}
                  style={[styles.previewBtn, {backgroundColor: colors.dangerSoft}]}
                  scaleTo={0.92}>
                  <Text style={[styles.previewBtnLabel, {color: colors.danger}]}>
                    Remove
                  </Text>
                </AnimatedPressable>
                <AnimatedPressable
                  onPress={() => setPreviewIdx(null)}
                  style={styles.previewClose}
                  scaleTo={0.92}>
                  <XIcon size={18} color={colors.textOnPrimary} />
                </AnimatedPressable>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </Modal>
    </View>
  );
};

void PlusIcon;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.cardMuted,
  },
  tileImg: {width: '100%', height: '100%'},
  addCol: {alignItems: 'stretch'},
  addTile: {
    width: TILE,
    height: (TILE - 8) / 2 + 8,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addTileMuted: {
    width: TILE,
    height: (TILE - 8) / 2,
    borderRadius: radii.md,
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.2,
  },
  emptyHint: {
    fontSize: fontSize.small,
    color: colors.textSubtle,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
  },
  previewWrap: {flex: 1, justifyContent: 'center'},
  previewImg: {
    height: '100%',
  },
  previewBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  previewCount: {
    color: '#FFFFFF',
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  previewActions: {flexDirection: 'row', gap: spacing.sm, alignItems: 'center'},
  previewBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  previewBtnLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
  },
  previewClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
