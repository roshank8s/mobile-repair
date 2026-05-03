import React from 'react';
import Svg, {Circle, Path, Polyline, Rect, Line} from 'react-native-svg';
import {colors} from '../theme/tokens';

type IconProps = {size?: number; color?: string; strokeWidth?: number};

const base = (size: number, color: string, sw: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const ChevronLeftIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2.4,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.textMuted,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx="11" cy="11" r="7" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({
  size = 18,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M22 16.92v3a2 2 0 0 1 -2.18 2 19.79 19.79 0 0 1 -8.63 -3.07 19.5 19.5 0 0 1 -6 -6 19.79 19.79 0 0 1 -3.07 -8.67 A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1 -.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27 -1.27a2 2 0 0 1 2.11 -.45 12.84 12.84 0 0 0 2.81 .7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.success,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M3 21l1.65 -3.8A9 9 0 0 1 12 3a9 9 0 0 1 9 9 9 9 0 0 1 -13.5 7.8L3 21" />
    <Path d="M9 10a0.5 0.5 0 0 0 1 0V9a0.5 0.5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 0.5 0 0 0 0 -1h-1a0.5 0.5 0 0 0 0 1" />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1 -2 2h-4v-6h-6v6H5a2 2 0 0 1 -2 -2V9.5z" />
  </Svg>
);

export const ClipboardIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Rect x="8" y="2" width="8" height="4" rx="1" />
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2H6a2 2 0 0 1 -2 -2V6a2 2 0 0 1 2 -2h2" />
    <Line x1="9" y1="12" x2="15" y2="12" />
    <Line x1="9" y1="16" x2="13" y2="16" />
  </Svg>
);

export const UsersIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M16 21v-2a4 4 0 0 0 -4 -4H6a4 4 0 0 0 -4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M22 21v-2a4 4 0 0 0 -3 -3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

export const PackageIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M21 16V8L12 3 3 8v8l9 5 9 -5z" />
    <Polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <Line x1="12" y1="22" x2="12" y2="12" />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06 .06a2 2 0 1 1 -2.83 2.83l-.06 -.06a1.65 1.65 0 0 0 -1.82 -.33 1.65 1.65 0 0 0 -1 1.51V21a2 2 0 1 1 -4 0v-.09a1.65 1.65 0 0 0 -1 -1.51 1.65 1.65 0 0 0 -1.82 .33l-.06 .06a2 2 0 1 1 -2.83 -2.83l.06 -.06a1.65 1.65 0 0 0 .33 -1.82 1.65 1.65 0 0 0 -1.51 -1H3a2 2 0 1 1 0 -4h.09a1.65 1.65 0 0 0 1.51 -1 1.65 1.65 0 0 0 -.33 -1.82l-.06 -.06a2 2 0 1 1 2.83 -2.83l.06 .06a1.65 1.65 0 0 0 1.82 .33h.09a1.65 1.65 0 0 0 1 -1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82 -.33l.06 -.06a2 2 0 1 1 2.83 2.83l-.06 .06a1.65 1.65 0 0 0 -.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0 -1.51 1z" />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.success,
  strokeWidth = 2.5,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

export const TrashIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.danger,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Polyline points="3 6 5 6 21 6" />
    <Path d="M19 6l-1 14a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2L5 6" />
    <Path d="M10 11v6" />
    <Path d="M14 11v6" />
    <Path d="M9 6V4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2" />
  </Svg>
);

export const AlertIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.warning,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71 -3L13.71 3.86a2 2 0 0 0 -3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const FileTextIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M14 2H6a2 2 0 0 0 -2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2V8z" />
    <Polyline points="14 2 14 8 20 8" />
    <Line x1="16" y1="13" x2="8" y2="13" />
    <Line x1="16" y1="17" x2="8" y2="17" />
    <Polyline points="10 9 9 9 8 9" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({
  size = 18,
  color = colors.textMuted,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

export const WrenchIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.accent,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77 -3.77a6 6 0 0 1 -7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1 -3 -3l6.91 -6.91a6 6 0 0 1 7.94 -7.94l-3.76 3.76z" />
  </Svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({
  size = 18,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Polyline points="12 5 19 12 12 19" />
  </Svg>
);

export const LogOutIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.danger,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M9 21H5a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h4" />
    <Polyline points="16 17 21 12 16 7" />
    <Line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

export const HelpIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2 -3 3 -3 3" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const BarChartIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Line x1="12" y1="20" x2="12" y2="10" />
    <Line x1="18" y1="20" x2="18" y2="4" />
    <Line x1="6" y1="20" x2="6" y2="16" />
  </Svg>
);

export const ReceiptIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M5 21V5a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-2.5 -1.5L14 21l-2 -1.5L10 21l-2.5 -1.5z" />
    <Line x1="9" y1="9" x2="15" y2="9" />
    <Line x1="9" y1="13" x2="15" y2="13" />
  </Svg>
);

export const PercentIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Line x1="19" y1="5" x2="5" y2="19" />
    <Circle cx="6.5" cy="6.5" r="2.5" />
    <Circle cx="17.5" cy="17.5" r="2.5" />
  </Svg>
);

export const StoreIcon: React.FC<IconProps> = ({
  size = 22,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M3 9l1.5 -5h15L21 9" />
    <Path d="M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1 -1V9" />
    <Path d="M3 9a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0" />
  </Svg>
);
