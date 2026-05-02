// Indian-grouping (lakh / crore) currency formatter. No Intl polyfill needed.
//   formatINR(123456.5)  -> "₹1,23,456.50"
//   formatINR(0)         -> "₹0"
//   formatINR(1234567)   -> "₹12,34,567"

const groupIndian = (intStr: string): string => {
  if (intStr.length <= 3) return intStr;
  const last3 = intStr.slice(-3);
  const rest = intStr.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
};

export const formatINR = (
  value: number,
  opts: {showDecimals?: boolean; symbol?: boolean} = {},
): string => {
  const {showDecimals = false, symbol = true} = opts;
  if (!Number.isFinite(value)) value = 0;
  const negative = value < 0;
  const abs = Math.abs(value);
  const fixed = showDecimals ? abs.toFixed(2) : Math.round(abs).toString();
  const [intPart, decPart] = fixed.split('.');
  const grouped = groupIndian(intPart);
  const out = decPart ? `${grouped}.${decPart}` : grouped;
  return `${negative ? '-' : ''}${symbol ? '₹' : ''}${out}`;
};

// Compact form for very large totals: "₹1.2L" / "₹2.4Cr".
export const formatINRCompact = (value: number): string => {
  if (!Number.isFinite(value)) return '₹0';
  const abs = Math.abs(value);
  if (abs >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return formatINR(value);
};
