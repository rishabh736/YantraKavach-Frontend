import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Bar, Button, Card, Empty, LiveBadge, PageHeader, Panel, Segmented, StatusBadge, STATUS_STYLE } from '../components/ui';
import { HealthRing } from '../components/HealthRing';
import { TrendChart } from '../components/charts';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { FACTOR_LABEL, WEIGHTS, factorScores, paramStatus, predict } from '../lib/engine';
import type { FactorKey } from '../lib/engine';
import { PARAM_KEYS, PARAMS, fmtValue } from '../lib/params';
import { RANGES, buildSeries } from '../lib/mock';
import { fmtDate, fmtDay, fmtTime } from '../lib/format';
import type { Machine, ParamKey, Range } from '../types';

function ParamChart({ machine, param, range }: { machine: Machine; param: ParamKey; range: Range }) {
  const { thresholds } = usePlant();
  const drifting = paramStatus(param, machine.readings[param], thresholds) !== 'healthy';
  const P = PARAMS[param];
  // series is generated per (machine, param, range, state); the live reading is shown in the header above
  const data = useMemo(
    () => buildSeries(machine.id, param, range, machine.readings[param], machine.baseline[param], drifting),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [machine.id, param, range, drifting],
  );
  const th = thresholds[param];
  return (
    <Panel title={<span className="flex items-center gap-2" style={{ color: P.color }}><P.icon size={16} /><span className="text-ink">{P.label}</span></span>} action={<span className="num text-xs text-muted">{P.unit}</span>}>
      <TrendChart data={data} color={P.color} unit={P.unit} decimals={P.decimals} name={P.label}
        warn={param === 'voltage' ? undefined : th.warn} crit={param === 'voltage' || param === 'sound' ? undefined : th.crit}
        timeFormat={RANGES[range].time ? fmtTime : fmtDay} />
    </Panel>
  );
}

export default function MachineDetail() {
  const { id = '' } = useParams();
  const { getMachine, statusOf, thresholds, alerts, maintenance } = usePlant();
  const { can } = useAuth();
  const [range, setRange] = useState<Range>('24H');
  const [logOpen, setLogOpen] = useState(false);
  const m = getMachine(id);
  if (!m) return <Empty title="Machine not found" text="Return to the machine list and choose another machine." />;

  const st = statusOf(m);
  const p = predict(m, thresholds);
  const f = factorScores(m, thresholds);
  const barColor = (v: number) => (v >= 80 ? 'bg-ok' : v >= 55 ? 'bg-warn' : 'bg-crit');

  return (
    <>
      <Link to="/machines" className="mb-3 inline-flex items-center gap-1.5 text-sm text-info hover:underline"><ArrowLeft size={15} />All machines</Link>
      <PageHeader title={m.name} sub={`${m.zone} · Machine ID M${m.id}`}
        actions={<>
          <StatusBadge status={st} size="lg" /><LiveBadge />
          {can('maintenance-write') && <Button size="sm" onClick={() => setLogOpen(true)}><Plus size={14} />Log maintenance</Button>}
        </>} />

      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="flex flex-wrap items-center gap-5 p-5">
          <HealthRing value={p.health} />
          <dl className="space-y-1.5 text-sm">
            {[['Uptime', `${m.uptime.toFixed(1)}%`], ['Operating hours', `${m.operatingHours.toLocaleString('en-IN')} h`], ['Last maintenance', fmtDate(m.lastMaintenance)], ['Next recommended', fmtDate(m.nextMaintenance)]].map(([a, b]) => (
              <div key={a} className="flex gap-2"><dt className="text-muted">{a}:</dt><dd className="num font-medium">{b}</dd></div>
            ))}
          </dl>
        </Card>
        <Panel title="Asset information">
          <dl className="space-y-2 text-sm">
            {[['Make', m.make], ['Model', m.model], ['Serial no.', m.serial], ['Rated power', `${m.ratedKw} kW`], ['Installed', String(m.installed)]].map(([a, b]) => (
              <div key={a} className="flex justify-between gap-3 border-b border-line pb-1.5 last:border-0"><dt className="text-muted">{a}</dt><dd className="num text-right font-medium">{b}</dd></div>
            ))}
          </dl>
        </Panel>
        <Panel title="How the score is calculated">
          <div className="space-y-2.5">
            {(Object.keys(WEIGHTS) as FactorKey[]).map((k) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-xs"><span>{FACTOR_LABEL[k]} <span className="text-muted">· weight {WEIGHTS[k] * 100}%</span></span><b className="num">{Math.round(f[k])}</b></div>
                <Bar value={f[k]} className={barColor(f[k])} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {PARAM_KEYS.map((k) => {
          const s = paramStatus(k, m.readings[k], thresholds);
          return (
            <Card key={k} className={`border-l-[3px] p-3 ${s === 'healthy' ? 'border-l-ok' : s === 'warning' ? 'border-l-warn' : 'border-l-crit'}`}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: PARAMS[k].color }}>{(() => { const I = PARAMS[k].icon; return <I size={14} />; })()}<span className="text-muted">{PARAMS[k].label}</span></div>
              <div className="num mt-1 text-2xl font-medium">{fmtValue(k, m.readings[k])} <span className="text-xs text-muted">{PARAMS[k].unit}</span></div>
            </Card>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Sensor trends</h2>
        <Segmented value={range} onChange={setRange} label="Time range" options={(['1H', '6H', '24H', '7D', '30D'] as Range[]).map((r) => ({ value: r, label: r }))} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">{PARAM_KEYS.map((k) => <ParamChart key={k} machine={m} param={k} range={range} />)}</div>

      <Panel className={`mt-4 border-l-4 ${STATUS_STYLE[st].top.replace('border-t', 'border-l')}`} title="AI Machine Health Analysis">
        <p className="mb-2 text-sm"><b className="num">Health Score: {p.health}%</b> <span className="text-muted">· AI confidence {p.confidence}%</span></p>
        {st === 'healthy' ? <p>Machine operating within normal parameters. No significant anomaly detected.</p> : (
          <>
            <p>{p.what} {p.why} {p.impact}</p>
            <p className="mt-2 text-sm"><b>Recommended:</b> {p.action}</p>
            <Link to="/predictive" state={{ machineId: m.id }} className="mt-3 inline-block"><Button size="sm">See full explanation</Button></Link>
          </>
        )}
      </Panel>
      <Panel className="mt-4" title="Recent alerts & work orders">
        {(() => {
          const rows = [
            ...alerts.filter((a) => a.machineId === m.id).map((a) => ({ id: a.id, ts: a.createdAt, text: a.message, tag: a.status === 'resolved' ? 'Alert · resolved' : 'Alert · active' })),
            ...maintenance.filter((r) => r.machineId === m.id).map((r) => ({ id: r.id, ts: +new Date(r.date), text: `${r.issue} — ${r.action}`, tag: `${r.id} · ${r.status}` })),
          ].sort((a, b) => b.ts - a.ts).slice(0, 6);
          return rows.length ? (
            <ul className="divide-y divide-line text-sm">{rows.map((r) => <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5"><span>{r.text}</span><span className="num text-xs text-muted">{r.tag} · {fmtDate(r.ts)}</span></li>)}</ul>
          ) : <p className="text-sm text-muted">No alerts or work orders recorded for this machine.</p>;
        })()}
      </Panel>
      <LogMaintenanceModal open={logOpen} machineId={m.id} onClose={() => setLogOpen(false)} />
    </>
  );
}
