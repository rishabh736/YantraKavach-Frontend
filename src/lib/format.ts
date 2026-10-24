export const pad = (n: number, l = 2) => String(n).padStart(l, '0');
export const fmtDate = (d: string | number | Date) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtTime = (t: number) => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const fmtDay = (t: number) => { const d = new Date(t); return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`; };
export const ago = (ts: number) => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
};
export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');
