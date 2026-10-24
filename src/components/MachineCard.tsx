import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Bar, Card, StatusBadge, STATUS_STYLE, cn } from './ui';
import { usePlant } from '../context/PlantContext';
import { PARAMS, fmtValue } from '../lib/params';
import { predict } from '../lib/engine';
import type { Machine } from '../types';

const hcolor = (h: number) => (h >= 80 ? 'bg-ok' : h >= 55 ? 'bg-warn' : 'bg-crit');

export function MachineCard({ machine }: { machine: Machine }) {
  const { statusOf, healthOf, thresholds } = usePlant();
  const [open, setOpen] = useState(false);
  const st = statusOf(machine);
  const h = healthOf(machine);
  const r = machine.readings;
  const p = st !== 'healthy' ? predict(machine, thresholds) : null;
  return (
    <Card className={cn('border-t-[3px] p-4', STATUS_STYLE[st].top)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/machines/${machine.id}`} className="block truncate font-display text-lg font-semibold hover:text-brand">{machine.name}</Link>
          <div className="text-xs text-muted">{machine.zone}</div>
        </div>
        <StatusBadge status={st} />
      </div>
      <div className="my-3 grid grid-cols-3 gap-2">
        {(['temperature', 'vibration', 'current'] as const).map((k) => (
          <div key={k}>
            <div className="label">{PARAMS[k].label.slice(0, 5)}</div>
            <div className="num text-[15px] font-medium">{fmtValue(k, r[k])}<span className="ml-0.5 text-[11px] text-muted">{PARAMS[k].unit}</span></div>
          </div>
        ))}
      </div>
      <div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-muted">Health score</span><b className="num text-sm">{h}%</b></div>
      <Bar value={h} className={hcolor(h)} />
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="mt-3 flex items-center gap-1 text-[13px] text-info hover:underline">
        {open ? 'Hide details' : 'Details'}<ChevronDown size={14} className={cn('transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-dashed border-line pt-3 text-[13px]">
          <div className="flex gap-4"><span>Voltage <b className="num">{fmtValue('voltage', r.voltage)} V</b></span><span>Sound <b className="num">{fmtValue('sound', r.sound)} dB</b></span></div>
          {p ? <p><b>Cause:</b> {p.why}<br /><b>Action:</b> {p.action}</p> : <p className="text-muted">Operating within normal parameters.</p>}
          <Link to={`/machines/${machine.id}`} className="inline-flex h-8 items-center rounded border border-line bg-raised px-3 font-medium hover:border-muted">Open monitoring</Link>
        </div>
      )}
    </Card>
  );
}
