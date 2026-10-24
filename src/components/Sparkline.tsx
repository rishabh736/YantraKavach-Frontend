export function Sparkline({ values, color, height = 32 }: { values: number[]; color: string; height?: number }) {
  if (values.length < 2) return null;
  const w = 120;
  const mn = Math.min(...values), mx = Math.max(...values);
  const X = (i: number) => (i * w) / (values.length - 1);
  const Y = (v: number) => height - 2 - ((height - 4) * (v - mn)) / (mx - mn || 1);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
