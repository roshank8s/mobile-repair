import {Vibration, AccessibilityInfo} from 'react-native';

let reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled().then(v => {
  reduceMotion = v;
});
AccessibilityInfo.addEventListener('reduceMotionChanged', v => {
  reduceMotion = v;
});

export const isReduceMotionEnabled = () => reduceMotion;

export const tap = () => {
  if (reduceMotion) return;
  Vibration.vibrate(8);
};
export const success = () => {
  if (reduceMotion) return;
  Vibration.vibrate([0, 12, 40, 18]);
};
export const warn = () => {
  if (reduceMotion) return;
  Vibration.vibrate([0, 18, 60, 18]);
};
