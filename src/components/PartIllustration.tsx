import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import {colors, radii} from '../theme/tokens';

export type PartKind =
  | 'display'
  | 'battery'
  | 'camera'
  | 'charging'
  | 'speaker'
  | 'glass'
  | 'back'
  | 'cable'
  | 'generic';

const KEYWORDS: {kind: PartKind; tests: RegExp[]}[] = [
  {kind: 'glass', tests: [/glass/i, /tempered/i]},
  {kind: 'display', tests: [/display/i, /screen/i, /lcd/i, /amoled/i]},
  {kind: 'battery', tests: [/battery/i, /cell/i]},
  {kind: 'camera', tests: [/camera/i, /lens/i]},
  {kind: 'charging', tests: [/charging port/i, /charger/i, /port/i, /jack/i]},
  {kind: 'speaker', tests: [/speaker/i, /earpiece/i, /audio/i, /receiver/i]},
  {kind: 'cable', tests: [/cable/i, /wire/i]},
  {kind: 'back', tests: [/back panel/i, /housing/i, /frame/i, /body/i]},
];

export const guessPartKind = (
  name?: string,
  compatModels?: string,
): PartKind => {
  const hay = `${name ?? ''} ${compatModels ?? ''}`;
  for (const k of KEYWORDS) {
    if (k.tests.some(t => t.test(hay))) return k.kind;
  }
  return 'generic';
};

const PALETTE: Record<
  PartKind,
  {bg: [string, string]; ink: string; accent: string}
> = {
  display: {bg: ['#EEF2FF', '#DBE4FF'], ink: '#3730A3', accent: '#6366F1'},
  battery: {bg: ['#ECFDF5', '#D1FAE5'], ink: '#065F46', accent: '#10B981'},
  camera: {bg: ['#FEF3F2', '#FEE2E2'], ink: '#9F1239', accent: '#F43F5E'},
  charging: {bg: ['#FFF7ED', '#FFEDD5'], ink: '#9A3412', accent: '#F97316'},
  speaker: {bg: ['#F5F3FF', '#EDE9FE'], ink: '#5B21B6', accent: '#8B5CF6'},
  glass: {bg: ['#ECFEFF', '#CFFAFE'], ink: '#155E75', accent: '#06B6D4'},
  back: {bg: ['#F1F5F9', '#E2E8F0'], ink: '#334155', accent: '#64748B'},
  cable: {bg: ['#FEFCE8', '#FEF9C3'], ink: '#854D0E', accent: '#EAB308'},
  generic: {bg: ['#FAF9F6', '#F5F5F5'], ink: '#525252', accent: '#A3A3A3'},
};

type Props = {
  kind?: PartKind;
  name?: string;
  compatModels?: string;
  size?: number;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Coloured SVG illustration for a part, picked from its name (display,
 * battery, camera, charging, etc.). Falls back to a soft package icon.
 *
 * Used as the default thumbnail when the shop hasn't uploaded a real
 * photo of the part — replaces the previous flat-grey box.
 */
export const PartIllustration: React.FC<Props> = ({
  kind: explicitKind,
  name,
  compatModels,
  size = 60,
  rounded,
  style,
}) => {
  const kind = explicitKind ?? guessPartKind(name, compatModels);
  const p = PALETTE[kind];
  const radius = rounded ?? radii.md;
  return (
    <View
      style={[
        styles.wrap,
        {width: size, height: size, borderRadius: radius},
        style,
      ]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{position: 'absolute'}}>
        <Defs>
          <SvgLinearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={p.bg[0]} />
            <Stop offset="100%" stopColor={p.bg[1]} />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" rx={radius * 1.6} fill="url(#bg)" />
        <KindGlyph kind={kind} ink={p.ink} accent={p.accent} />
      </Svg>
    </View>
  );
};

const KindGlyph: React.FC<{kind: PartKind; ink: string; accent: string}> = ({
  kind,
  ink,
  accent,
}) => {
  switch (kind) {
    case 'display':
      return (
        <>
          <Rect x="32" y="20" width="36" height="60" rx="6" fill={ink} />
          <Rect x="35" y="26" width="30" height="48" rx="3" fill="#FFFFFF" />
          <Rect x="38" y="30" width="24" height="6" rx="1" fill={accent} opacity={0.7} />
          <Rect x="38" y="40" width="18" height="3" rx="1" fill={ink} opacity={0.3} />
          <Rect x="38" y="46" width="14" height="3" rx="1" fill={ink} opacity={0.2} />
          <Circle cx="50" cy="74" r="1.5" fill={ink} />
        </>
      );
    case 'battery':
      return (
        <>
          <Rect x="22" y="34" width="50" height="32" rx="5" fill="#FFFFFF" stroke={ink} strokeWidth="2.5" />
          <Rect x="72" y="42" width="6" height="16" rx="2" fill={ink} />
          <Rect x="26" y="38" width="28" height="24" rx="2" fill={accent} />
          <Path d="M40 44 L36 54 H42 L38 62" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'camera':
      return (
        <>
          <Rect x="22" y="28" width="56" height="44" rx="6" fill={ink} />
          <Circle cx="50" cy="50" r="14" fill="#FFFFFF" />
          <Circle cx="50" cy="50" r="9" fill={accent} />
          <Circle cx="50" cy="50" r="4" fill={ink} />
          <Circle cx="68" cy="36" r="2.5" fill={accent} />
          <Rect x="38" y="22" width="14" height="6" rx="2" fill={ink} />
        </>
      );
    case 'charging':
      return (
        <>
          <Rect x="36" y="16" width="28" height="28" rx="3" fill={ink} />
          <Rect x="42" y="44" width="16" height="14" rx="1" fill={ink} />
          <Rect x="46" y="22" width="3" height="14" rx="1" fill={accent} />
          <Rect x="51" y="22" width="3" height="14" rx="1" fill={accent} />
          <Path d="M50 58 L50 72" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="50" cy="80" r="6" fill={accent} />
          <Path d="M48 80 L52 80" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'speaker':
      return (
        <>
          <Path
            d="M30 40 H46 L60 28 V72 L46 60 H30 Z"
            fill={ink}
          />
          <Path
            d="M66 40 a12 12 0 0 1 0 20"
            stroke={accent}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M70 32 a22 22 0 0 1 0 36"
            stroke={accent}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity={0.6}
          />
        </>
      );
    case 'glass':
      return (
        <>
          <Rect x="30" y="18" width="40" height="64" rx="6" fill={ink} />
          <Rect x="33" y="22" width="34" height="56" rx="3" fill="#FFFFFF" />
          <Path
            d="M38 30 L62 30 L62 54 L50 70 L38 54 Z"
            fill={accent}
            opacity={0.35}
          />
          <Path d="M46 36 L54 36" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case 'back':
      return (
        <>
          <Rect x="30" y="16" width="40" height="68" rx="8" fill={ink} />
          <Rect x="38" y="22" width="14" height="14" rx="3" fill={accent} />
          <Circle cx="44" cy="29" r="3.5" fill={ink} />
          <Circle cx="44" cy="29" r="2" fill="#FFFFFF" />
          <Rect x="58" y="24" width="6" height="6" rx="1.5" fill={accent} opacity={0.8} />
          <Rect x="40" y="68" width="20" height="4" rx="2" fill="#FFFFFF" opacity={0.3} />
        </>
      );
    case 'cable':
      return (
        <>
          <Path
            d="M22 34 q14 -10 28 0 t28 0"
            stroke={ink}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M22 56 q14 -10 28 0 t28 0"
            stroke={accent}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <Rect x="14" y="64" width="12" height="14" rx="2" fill={ink} />
          <Rect x="74" y="22" width="12" height="14" rx="2" fill={ink} />
        </>
      );
    case 'generic':
    default:
      return (
        <>
          <Path
            d="M50 18 L78 32 L78 64 L50 82 L22 64 L22 32 Z"
            fill={ink}
            opacity={0.18}
          />
          <Path
            d="M50 18 L78 32 L50 46 L22 32 Z"
            fill={accent}
            opacity={0.6}
          />
          <Path d="M50 46 L50 82" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M22 32 L50 46 L78 32" stroke={ink} strokeWidth="2" fill="none" />
        </>
      );
  }
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardMuted,
  },
});
