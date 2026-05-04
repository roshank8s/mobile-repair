// Lightweight date helpers using DD/MM/YYYY (Indian convention).
const pad = (n: number) => n.toString().padStart(2, '0');

export const toIso = (d: Date): string => d.toISOString();
export const fromIso = (s?: string | null): Date | null =>
  s ? new Date(s) : null;

export const formatDate = (d: Date | string): string => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
};

export const formatDateTime = (d: Date | string): string => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return `${formatDate(dt)} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

export const formatRelative = (d: Date | string): string => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  const diffMs = Date.now() - dt.getTime();
  const sec = Math.round(diffMs / 1000);
  if (Math.abs(sec) < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return `${Math.abs(min)}m ${min < 0 ? 'left' : 'ago'}`;
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return `${Math.abs(hr)}h ${hr < 0 ? 'left' : 'ago'}`;
  const day = Math.round(hr / 24);
  if (Math.abs(day) < 30) return `${Math.abs(day)}d ${day < 0 ? 'left' : 'ago'}`;
  return formatDate(dt);
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isToday = (d: Date | string): boolean => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return isSameDay(dt, new Date());
};

export const startOfDay = (d: Date): Date => {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
};

export const addDays = (d: Date, n: number): Date => {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
};
