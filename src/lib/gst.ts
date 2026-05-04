// GST split: intra-state -> CGST + SGST (each = rate/2). Inter-state -> IGST.
// For V1 we treat all transactions as intra-state (most repair-shop walk-ins are local).

export type GstSplit = {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  ratePct: number;
};

export const splitGstFromInclusive = (
  totalInclusive: number,
  ratePct: number,
  interState = false,
): GstSplit => {
  const factor = 1 + ratePct / 100;
  const subtotal = +(totalInclusive / factor).toFixed(2);
  const taxAmt = +(totalInclusive - subtotal).toFixed(2);
  if (interState) {
    return {
      subtotal,
      cgst: 0,
      sgst: 0,
      igst: taxAmt,
      total: totalInclusive,
      ratePct,
    };
  }
  const half = +(taxAmt / 2).toFixed(2);
  return {
    subtotal,
    cgst: half,
    sgst: +(taxAmt - half).toFixed(2),
    igst: 0,
    total: totalInclusive,
    ratePct,
  };
};

export const splitGstFromSubtotal = (
  subtotal: number,
  ratePct: number,
  interState = false,
): GstSplit => {
  const taxAmt = +((subtotal * ratePct) / 100).toFixed(2);
  const total = +(subtotal + taxAmt).toFixed(2);
  if (interState) {
    return {subtotal, cgst: 0, sgst: 0, igst: taxAmt, total, ratePct};
  }
  const half = +(taxAmt / 2).toFixed(2);
  return {
    subtotal,
    cgst: half,
    sgst: +(taxAmt - half).toFixed(2),
    igst: 0,
    total,
    ratePct,
  };
};

// HSN code 998719 — "Maintenance and repair services of telephone sets and other communication equipment".
export const REPAIR_HSN = '998719';

// Convert paisa-precise number to "in words" — used on the GST invoice footer.
const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

const twoDigit = (n: number): string => {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
};
const threeDigit = (n: number): string => {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return (h ? ONES[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? twoDigit(r) : '');
};

export const numberToIndianWords = (num: number): string => {
  if (!Number.isFinite(num)) return '';
  if (num === 0) return 'Zero Rupees Only';
  const rupees = Math.floor(Math.abs(num));
  const paise = Math.round((Math.abs(num) - rupees) * 100);
  const crore = Math.floor(rupees / 1_00_00_000);
  const lakh = Math.floor((rupees % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((rupees % 1_00_000) / 1_000);
  const remainder = rupees % 1_000;
  let out = '';
  if (crore) out += threeDigit(crore) + ' Crore ';
  if (lakh) out += threeDigit(lakh) + ' Lakh ';
  if (thousand) out += threeDigit(thousand) + ' Thousand ';
  if (remainder) out += threeDigit(remainder);
  out = out.trim() + ' Rupees';
  if (paise) out += ' and ' + twoDigit(paise) + ' Paise';
  return out + ' Only';
};
