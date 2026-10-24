export function HealthRing({ value, size = 128, stroke = 9 }: { value: number; size?: number; stroke?: number }) {
  const r = size / 2 - stroke;
  const C = 2 * Math.PI * r;
  const color = value >= 80 ? 'rgb(var(--ok))' : value >= 55 ? 'rgb(var(--warn))' : 'rgb(var(--crit))';
  const label = value >= 80 ? 'HEALTHY' : value >= 55 ? 'WATCH' : 'CRITICAL';
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Health score ${value}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${(C * value) / 100} ${C}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .6s' }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-bold leading-none num">{value}%</div>
        <div className="mt-1 font-mono text-[10px] font-semibold" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}
