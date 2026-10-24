import type { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { PARAM_KEYS, PARAMS } from '../lib/params';

const Node = ({ title, sub, children }: { title: string; sub: string; children?: ReactNode }) => (
  <div className="rounded-md border border-line border-l-[3px] border-l-brand bg-surface px-4 py-3 shadow-panel">
    <div className="font-display text-lg font-semibold">{title}</div>
    <div className="text-sm text-muted">{sub}</div>
    {children}
  </div>
);
const Arrow = () => <div className="flex h-7 items-center justify-center text-brand"><ArrowDown size={18} /></div>;

export function Architecture() {
  return (
    <div className="mx-auto flex max-w-xl flex-col">
      <Node title="MACHINE" sub="Existing legacy machinery — no modification" />
      <Arrow />
      <Node title="IoT SENSOR LAYER" sub="Clamp-on and magnetic-mount sensors">
        <div className="mt-2 flex flex-wrap gap-1.5">{PARAM_KEYS.map((k) => <span key={k} className="rounded-sm border border-line bg-raised px-2 py-0.5 font-mono text-xs text-info">{PARAMS[k].label}</span>)}</div>
      </Node>
      <Arrow />
      <Node title="EDGE PROCESSING" sub="Filtering, feature extraction and local inference" />
      <Arrow />
      <Node title="ML / ANOMALY DETECTION" sub="Learns each machine's baseline, flags deviation, estimates risk window" />
      <Arrow />
      <Node title="CLOUD / DATABASE" sub="Time-series storage, history and reporting" />
      <Arrow />
      <Node title="YANTRA KAVACH DASHBOARD" sub="Plant overview, machine health and explainable predictions" />
      <Arrow />
      <Node title="ALERT + PREDICTIVE MAINTENANCE" sub="Technician notified with what, where, why, impact and action" />
    </div>
  );
}
