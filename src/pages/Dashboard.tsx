import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Wrench } from 'lucide-react';
import { Button, Card, Empty, LiveBadge, PageHeader, Panel, Segmented, StatusBadge, STATUS_STYLE, cn } from '../components/ui';
import { MachineCard } from '../components/MachineCard';
import { FactoryFloor } from '../components/FactoryFloor';
import { usePlant } from '../context/PlantContext';
import { useToast } from '../context/ToastContext';
import { TECHNICIANS } from '../lib/mock';
import { ago } from '../lib/format';
import { PARAM_KEYS, PARAMS, fmtValue } from '../lib/params';
import { predict } from '../lib/engine';
import type { Status } from '../types';

export default function Dashboard() {
  const { machines, alerts, maintenance, sensors, settings, statusOf, healthOf, thresholds, getMachine } = usePlant();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [showAll, setShowAll] = useState(false);

  const stat = useMemo(() => {
    const c = { healthy: 0, warning: 0, critical: 0 };
    machines.forEach((m) => { c[statusOf(m)]++; });
    return c;
  }, [machines, statusOf]);
  const active = alerts.filter((a) => a.status !== 'resolved').length;
  const availability = machines.reduce((s, m) => s + m.uptime, 0) / (machines.length || 1);
  const attention = machines
    .filter((m) => statusOf(m) !== 'healthy')
    .sort((a, b) => (statusOf(b) === 'critical' ? 1 : 0) - (statusOf(a) === 'critical' ? 1 : 0) || healthOf(a) - healthOf(b));
  const list = machines.filter((m) => filter === 'all' || statusOf(m) === filter);
  const shown = showAll ? list : list.slice(0, 8);

  const now = new Date();
  const hr = now.getHours() + now.getMinutes() / 60;
  const shift = hr >= 6 && hr < 14 ? 'Shift A' : hr >= 14 && hr < 22 ? 'Shift B' : 'Shift C';
  const supervisor = TECHNICIANS[hr >= 6 && hr < 14 ? 1 : hr >= 14 && hr < 22 ? 2 : 3];
  const loadKw = machines.reduce((sum, m) => sum + (m.readings.current * m.readings.voltage * 1.732 * 0.85) / 1000, 0);
  const energyToday = loadKw * hr * 0.72;
  const openOrders = maintenance.filter((r) => r.status !== 'Completed').length;
  const sensorsOnline = sensors.length ? Math.round((sensors.filter((x) => x.state === 'online').length / sensors.length) * 100) : 0;
  const activity = [
    ...alerts.map((a) => ({ id: a.id, ts: a.createdAt, kind: 'alert' as const, text: `${getMachine(a.machineId)?.name ?? a.machineId}: ${a.message}`, tone: a.severity === 'critical' ? 'text-crit' : a.severity === 'high' ? 'text-brand' : 'text-warn' })),
    ...maintenance.filter((r) => r.status !== 'Scheduled').map((r) => ({ id: r.id, ts: +new Date(r.date), kind: 'work' as const, text: `${getMachine(r.machineId)?.name ?? r.machineId}: ${r.issue} — ${r.status.toLowerCase()} (${r.technician})`, tone: 'text-info' })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 7);

  const kpis = [
    { label: 'Total Machines', value: machines.length, tone: 'border-l-info' },
    { label: 'Healthy', value: stat.healthy, tone: 'border-l-ok' },
    { label: 'At Risk', value: stat.warning, tone: 'border-l-warn' },
    { label: 'Critical', value: stat.critical, tone: 'border-l-crit' },
    { label: 'Active Alerts', value: active, tone: 'border-l-brand' },
    { label: 'Availability', value: `${availability.toFixed(1)}%`, tone: 'border-l-info' },
  ];

  return (
    <>
      <PageHeader title="Plant Overview" sub={`${settings.plantName} · ${shift} · Supervisor: ${supervisor}`}
        actions={<LiveBadge />} />

      <section aria-label="Needs attention" className="mb-5">
        <div className="mb-2 flex items-baseline justify-between"><h2 className="text-xl font-semibold">Needs attention now</h2><span className="text-sm text-muted">{attention.length} of {machines.length} machines</span></div>
        {attention.length ? (
          <div className="space-y-2">
            {attention.slice(0, 5).map((m) => {
              const p = predict(m, thresholds);
              const st = statusOf(m);
              return (
                <div key={m.id} className={cn('grid items-center gap-3 rounded-md border border-line border-l-4 bg-surface p-3 sm:grid-cols-[auto_1fr_auto]', st === 'critical' ? 'border-l-crit' : 'border-l-warn')}>
                  <StatusBadge status={st} />
                  <div className="min-w-0 text-sm">
                    <div><b>{m.name}</b> <span className="text-muted">· Health {p.health}%</span></div>
                    <div className="text-muted"><b className="text-ink">Cause:</b> {p.why} <b className="text-ink">Action:</b> {p.action}</div>
                  </div>
                  <Link to={`/machines/${m.id}`}><Button size="sm">View machine</Button></Link>
                </div>
              );
            })}
          </div>
        ) : <Empty title="All machines healthy" text="No action needed." />}
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="Plant KPIs">
        {kpis.map((k) => (
          <Card key={k.label} className={cn('border-l-[3px] p-4', k.tone)}>
            <div className="num font-display text-4xl font-semibold leading-none">{k.value}</div>
            <div className="mt-2 text-xs text-muted">{k.label}</div>
          </Card>
        ))}
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Plant operations">
        {[
          ['Plant load', `${loadKw.toFixed(0)} kW`, 'Live, from current × voltage'],
          ['Energy today', `${Math.round(energyToday).toLocaleString('en-IN')} kWh`, `≈ ₹ ${Math.round(energyToday * 7.6).toLocaleString('en-IN')} at ₹7.60/kWh`],
          ['Open work orders', String(openOrders), 'In progress or scheduled'],
          ['Sensors online', `${sensorsOnline}%`, `${sensors.filter((x) => x.state !== 'online').length} need attention`],
        ].map(([k, v, d]) => (
          <Card key={k} className="p-4"><div className="label">{k}</div><div className="num mt-1 font-display text-2xl font-semibold leading-none">{v}</div><div className="mt-1.5 text-xs text-muted">{d}</div></Card>
        ))}
      </section>

      <section className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Digital twin · factory floor" action={<span className="text-xs text-muted">Select a machine</span>}><FactoryFloor /></Panel>
        <Panel title="Live telemetry · CNC Machine 01">
          {machines[0] && (
            <ul className="divide-y divide-line">
              {PARAM_KEYS.map((k) => (
                <li key={k} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-2" style={{ color: PARAMS[k].color }}>{(() => { const I = PARAMS[k].icon; return <I size={16} />; })()}<span className="text-ink">{PARAMS[k].label}</span></span>
                  <b className="num">{fmtValue(k, machines[0].readings[k])} <span className="font-normal text-muted">{PARAMS[k].unit}</span></b>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">Values refresh every 1.5 seconds. Thresholds are set in Settings.</p>
        </Panel>
      </section>

      <Panel title="Recent activity" className="mb-5">
        <ul className="divide-y divide-line">
          {activity.map((x) => (
            <li key={x.id} className="flex items-start gap-3 py-2.5 text-sm">
              {x.kind === 'alert' ? <Bell size={15} className={cn('mt-0.5 shrink-0', x.tone)} /> : <Wrench size={15} className={cn('mt-0.5 shrink-0', x.tone)} />}
              <span className="min-w-0 flex-1">{x.text}</span>
              <span className="num shrink-0 text-xs text-muted">{ago(x.ts)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Machine grid</h2>
        <Segmented value={filter} onChange={setFilter} label="Filter by status"
          options={[{ value: 'all', label: 'All' }, { value: 'healthy', label: 'Healthy' }, { value: 'warning', label: 'Warning' }, { value: 'critical', label: 'Critical' }]} />
      </div>
      {shown.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{shown.map((m) => <MachineCard key={m.id} machine={m} />)}</div> : <Empty title="No machines in this state" />}
      {list.length > 8 && <div className="mt-4 text-center"><Button onClick={() => setShowAll(!showAll)}>{showAll ? 'Show fewer' : `Show all ${list.length}`}</Button></div>}
    </>
  );
}
