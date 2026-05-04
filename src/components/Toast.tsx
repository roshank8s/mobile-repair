import React, {createContext, useCallback, useContext, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
} from 'react-native-reanimated';
import {colors, fontSize, fontWeight, radii, shadows, spacing} from '../theme/tokens';
import {CheckIcon, AlertIcon} from './icons';

type ToastKind = 'success' | 'info' | 'error';
type Toast = {id: number; kind: ToastKind; message: string};

type Ctx = {
  show: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<Ctx | null>(null);

let nextId = 1;

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = nextId++;
    setToasts(t => [...t, {id, kind, message}]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={{show}}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map(t => (
          <ToastView key={t.id} toast={t} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const ToastView: React.FC<{toast: Toast}> = ({toast}) => {
  const palette = KIND_COLORS[toast.kind];
  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify().damping(18)}
      exiting={FadeOutDown.duration(160)}
      style={[styles.toast, {backgroundColor: palette.bg, borderColor: palette.border}]}>
      <View style={[styles.iconWrap, {backgroundColor: palette.iconBg}]}>
        {toast.kind === 'success' ? (
          <CheckIcon size={16} color={palette.icon} />
        ) : toast.kind === 'error' ? (
          <AlertIcon size={16} color={palette.icon} />
        ) : (
          <CheckIcon size={16} color={palette.icon} />
        )}
      </View>
      <Text style={[styles.message, {color: palette.text}]}>{toast.message}</Text>
    </Animated.View>
  );
};

const KIND_COLORS: Record<
  ToastKind,
  {bg: string; border: string; iconBg: string; icon: string; text: string}
> = {
  success: {
    bg: colors.card,
    border: colors.border,
    iconBg: colors.successSoft,
    icon: colors.success,
    text: colors.text,
  },
  info: {
    bg: colors.card,
    border: colors.border,
    iconBg: colors.infoSoft,
    icon: colors.info,
    text: colors.text,
  },
  error: {
    bg: colors.card,
    border: colors.border,
    iconBg: colors.dangerSoft,
    icon: colors.danger,
    text: colors.text,
  },
};

export const useToast = (): Ctx => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    minWidth: 240,
    maxWidth: '90%',
    ...shadows.raised,
  },
  iconWrap: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  message: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
});
