import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';

/**
 * The picked image, encoded as a `data:image/jpeg;base64,...` URI so it can
 * be persisted directly into our AsyncStorage-backed JSON state without
 * worrying about file paths going stale when the OS clears the cache.
 *
 * Images are compressed to ~1024px max dimension at 0.7 JPEG quality before
 * encoding, which keeps each image under ~80 KB.
 */
export type PickedImage = {
  dataUri: string;
  width?: number;
  height?: number;
};

const COMMON_OPTS = {
  mediaType: 'photo' as const,
  quality: 0.7 as const,
  maxWidth: 1024,
  maxHeight: 1024,
  includeBase64: true,
  saveToPhotos: false,
};

const toDataUri = (
  base64?: string,
  type?: string | null,
): string | null => {
  if (!base64) return null;
  const mime = type || 'image/jpeg';
  return `data:${mime};base64,${base64}`;
};

const openSettings = () => {
  Linking.openSettings().catch(() => {});
};

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted) return true;
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera access',
        message: 'Repair Shop needs the camera to capture device-condition photos.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      },
    );
    if (res === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Camera blocked',
        'Camera permission was permanently denied. Open settings to allow it for Repair Shop.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open settings', onPress: openSettings},
        ],
      );
    }
    return false;
  } catch {
    return false;
  }
};

export const pickFromGallery = async (): Promise<PickedImage | null> => {
  try {
    const opts: ImageLibraryOptions = {
      ...COMMON_OPTS,
      selectionLimit: 1,
    };
    const result = await launchImageLibrary(opts);
    if (result.didCancel || !result.assets?.length) return null;
    if (result.errorCode) {
      Alert.alert('Photo error', result.errorMessage ?? 'Could not load photo.');
      return null;
    }
    const a = result.assets[0];
    const uri = toDataUri(a.base64, a.type);
    if (!uri) return null;
    return {dataUri: uri, width: a.width, height: a.height};
  } catch (e: any) {
    Alert.alert('Photo error', e?.message ?? 'Could not pick a photo.');
    return null;
  }
};

export const pickFromCamera = async (): Promise<PickedImage | null> => {
  // Explicitly request the runtime permission ourselves so the user always
  // sees the system dialog. The library does this internally too, but a
  // belt-and-braces approach avoids the silent "camera does nothing" case
  // some devices show when something in the chain swallows the request.
  const ok = await requestCameraPermission();
  if (!ok) return null;

  try {
    const opts: CameraOptions = {
      ...COMMON_OPTS,
      cameraType: 'back',
    };
    const result = await launchCamera(opts);
    if (result.didCancel) return null;
    if (result.errorCode) {
      if (result.errorCode === 'camera_unavailable') {
        Alert.alert(
          'No camera',
          'This device does not seem to have a camera available.',
        );
      } else if (result.errorCode === 'permission') {
        Alert.alert(
          'Camera permission needed',
          'Enable camera permission for Repair Shop in your device settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open settings', onPress: openSettings},
          ],
        );
      } else {
        Alert.alert(
          'Photo error',
          result.errorMessage ?? 'Could not capture photo.',
        );
      }
      return null;
    }
    if (!result.assets?.length) return null;
    const a = result.assets[0];
    const uri = toDataUri(a.base64, a.type);
    if (!uri) return null;
    return {dataUri: uri, width: a.width, height: a.height};
  } catch (e: any) {
    Alert.alert('Photo error', e?.message ?? 'Could not capture a photo.');
    return null;
  }
};

/**
 * Show a Take photo / Choose from gallery / Cancel sheet, then return the
 * picked image (or null if cancelled).
 */
export const choosePhoto = (): Promise<PickedImage | null> =>
  new Promise(resolve => {
    Alert.alert('Add photo', 'Where from?', [
      {
        text: 'Take photo',
        onPress: async () => resolve(await pickFromCamera()),
      },
      {
        text: 'Choose from gallery',
        onPress: async () => resolve(await pickFromGallery()),
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => resolve(null),
      },
    ]);
  });
