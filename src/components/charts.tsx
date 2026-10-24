import type { ReactNode } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SeriesPoint } from '../lib/mock';

const AXIS = { fontSize: 11, fill: 'rgb(139,150,160)', fontFamily: 'IBM Plex Mono, monospace' };
const TIP = {
  contentStyle: { background: 'rgb(var(--raised))', border: '1px solid rgb(var(--line))', borderRadius: 4, fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', color: 'rgb(var(--ink))' },
  labelStyle: { color: 'rgb(var(--muted))' },
  cursor: { stroke: 'rgb(139,150,160)', strokeOpacity: 0.5 },
};

/** Horizontally scrollable wrapper so charts stay legible on 320px screens. */
function Scroll({ children, min = 520 }: { children: ReactNode; min?: number }) {
  return <div className="overflow-x-auto"><div style={{ minWidth: min }}>{children}</div></div>;
}

export function TrendChart({ data, color, unit, decimals = 1, warn, crit, timeFormat, height = 220, name }: {
  data: SeriesPoint[]; color: string; unit: string; decimals?: number; warn?: number; crit?: number;
  timeFormat: (t: number) => string; height?: number; name: string;
}) {
  const vals = data.map((d) => d.v);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const near = (v?: number) => v !== undefined && v < mx * 1.35 && v > mn * 0.7;
  const lo = Math.min(mn, near(warn) ? (warn as number) : mn);
  const hi = Math.max(mx, near(crit) ? (crit as number) : near(warn) ? (warn as number) : mx);
  const pad = (hi - lo) * 0.12 || 1;
  const id = `g-${name.replace(/\W/g, '')}`;
  return (
    <Scroll>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 10, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="t" tickFormatter={timeFormat} tick={AXIS} axisLine={false} tickLine={false} minTickGap={48} />
          <YAxis domain={[Math.max(0, lo - pad), hi + pad]} tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => Number(v).toFixed(decimals)} width={46} />
          <Tooltip {...TIP} labelFormatter={(t: unknown) => timeFormat(Number(t))} formatter={(v: unknown) => [`${Number(v).toFixed(decimals)} ${unit}`, name]} />
          {near(warn) && <ReferenceLine y={warn} stroke="rgb(var(--warn))" strokeDasharray="5 4" label={{ value: 'WARN', fill: 'rgb(245,185,59)', fontSize: 10, position: 'insideTopRight' }} />}
          {near(crit) && <ReferenceLine y={crit} stroke="rgb(var(--crit))" strokeDasharray="5 4" label={{ value: 'CRIT', fill: 'rgb(255,77,64)', fontSize: 10, position: 'insideTopRight' }} />}
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Scroll>
  );
}

export function MultiLine({ data, series, height = 240, decimals = 1 }: {
  data: Record<string, number | string>[]; series: { key: string; name: string; color: string }[]; height?: number; decimals?: number;
}) {
  return (
    <Scroll min={460}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 10, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} width={46} tickFormatter={(v: unknown) => Number(v).toFixed(decimals)} />
          <Tooltip {...TIP} formatter={(v: unknown) => Number(v).toFixed(decimals)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={1.8} dot={false} isAnimationActive={false} />)}
        </LineChart>
      </ResponsiveContainer>
    </Scroll>
  );
}

export function BarsChart({ data, color, unit = '', decimals = 0, height = 220 }: {
  data: { label: string; value: number }[]; color: string; unit?: string; decimals?: number; height?: number;
}) {
  return (
    <Scroll min={420}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 10, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} width={46} tickFormatter={(v: unknown) => Number(v).toFixed(decimals)} />
          <Tooltip {...TIP} cursor={{ fill: 'rgb(139,150,160)', fillOpacity: 0.1 }} formatter={(v: unknown) => `${Number(v).toFixed(decimals)}${unit}`} />
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} maxBarSize={32} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </Scroll>
  );
}

export function Donut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-36 w-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={44} outerRadius={64} stroke="none" isAnimationActive={false}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip {...TIP} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-2xl font-bold">{total}</div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-muted">{d.name}</span>
            <b className="num ml-2">{d.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
