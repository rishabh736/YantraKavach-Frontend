import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Bar, Card, Empty, LiveBadge, PageHeader, Panel, StatusBadge, STATUS_STYLE, cn } from '../components/ui';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { predict } from '../lib/engine';
import { PARAMS, fmtValue } from '../lib/params';

const STAGES = ['Normal', 'Minor anomaly', 'Pattern detected', 'Risk increasing', 'Maintenance recommended'];
const RISK_TEXT = { Low: 'text-ok', Medium: 'text-warn', High: 'text-crit' } as const;

export default function Predictive() {
  const { machines, statusOf, healthOf, thresholds } = usePlant();
  const { can } = useAuth();
  const loc = useLocation();
  const [sel, setSel] = useState<string | undefined>((loc.state as { machineId?: string } | null)?.machineId);
  const [log, setLog] = useState(false);

  const risk = machines.filter((m) => statusOf(m) !== 'healthy')
    .sort((a, b) => (statusOf(b) === 'critical' ? 1 : 0) - (statusOf(a) === 'critical' ? 1 : 0) || healthOf(a) - healthOf(b));
  const machine = machines.find((m) => m.id === sel) ?? risk[0] ?? machines[0];
  useEffect(() => { if (sel) document.getElementById('why')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [sel]);
  if (!machine) return <Empty title="No data yet" />;
  const p = predict(machine, thresholds);

  return (
    <>
      <PageHeader title="Predictive Maintenance Intelligence" sub="Every prediction shows what was detected, where, why, and what to do." actions={<LiveBadge />} />
      {risk.length ? (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {risk.slice(0, 6).map((m) => {
            const q = predict(m, thresholds);
            const st = statusOf(m);
            return (
              <Card key={m.id} className={cn('border-t-[3px] p-4', STATUS_STYLE[st].top)}>
                <div className="flex items-center justify-between gap-2"><h3 className="truncate text-lg font-semibold">{m.name}</h3><StatusBadge status={st} /></div>
                <dl className="my-3 space-y-1.5 text-sm">
                  <div><dt className="inline text-muted">Failure risk: </dt><dd className={cn('inline font-semibold', RISK_TEXT[q.risk])}>{q.risk}</dd></div>
                  <div><dt className="inline text-muted">Estimated risk window: </dt><dd className="num inline font-medium">{q.window}</dd></div>
                  <div><dt className="inline text-muted">Detected pattern: </dt><dd className="inline">{q.pattern}</dd></div>
                  <div><dt className="inline text-muted">Recommended action: </dt><dd className="inline">{q.action}</dd></div>
                </dl>
                <Button size="sm" variant={machine.id === m.id ? 'primary' : 'default'} onClick={() => setSel(m.id)}>Why is the machine at risk?</Button>
              </Card>
            );
          })}
        </div>
      ) : <div className="mb-5"><Empty title="No machines at risk" text="All machines are within normal patterns." /></div>}

      <div id="why" className="scroll-mt-20">
        <Panel title={`Why is ${machine.name} at risk?`} action={<StatusBadge status={p.status} />}>
          {p.status === 'healthy' ? <p className="text-muted">No anomaly detected. Risk window: {p.window}.</p> : (
            <div className="grid gap-6 lg:grid-cols-2">
              <dl className="divide-y divide-line text-sm">
                {[['WHAT', p.what], ['WHERE', p.where], ['WHY', p.why + (p.abnormal.includes('temperature') && p.worst !== 'temperature' ? ' Temperature is rising with it.' : '')], ['IMPACT', p.impact], ['ACTION', p.action]].map(([a, b]) => (
                  <div key={a} className="grid grid-cols-[84px_1fr] gap-3 py-3"><dt className="font-mono text-xs font-semibold text-brand">{a}</dt><dd>{b}</dd></div>
                ))}
              </dl>
              <div className="space-y-4 text-sm">
                <div><div className="mb-1 flex justify-between"><span className="text-muted">AI Confidence</span><b className="num">{p.confidence}%</b></div><Bar value={p.confidence} className="bg-info" /></div>
                <div><span className="text-muted">Evidence: </span>{p.abnormal.map((k) => `${PARAMS[k].label} ${fmtValue(k, machine.readings[k])} ${PARAMS[k].unit} (baseline ${fmtValue(k, machine.baseline[k])})`).join('; ')}</div>
                <div><span className="text-muted">Risk: </span><b className={RISK_TEXT[p.risk]}>{p.risk}</b> · window <b className="num">{p.window}</b></div>
                <div className="flex flex-wrap gap-2">
                  {can('maintenance-write') && <Button variant="primary" size="sm" onClick={() => setLog(true)}>Schedule maintenance</Button>}
                  <Link to={`/machines/${machine.id}`}><Button size="sm">View machine</Button></Link>
                </div>
              </div>
            </div>
          )}
          <h4 className="mb-2 mt-6 text-base font-semibold">Degradation timeline</h4>
          <ol className="flex overflow-x-auto">
            {STAGES.map((s, i) => (
              <li key={s} className={cn('min-w-[120px] flex-1 border-t-4 px-2 py-2.5 text-[13px]', i < p.stage ? 'border-warn' : i === p.stage ? 'border-crit font-semibold' : 'border-line text-muted')}>{s}</li>
            ))}
          </ol>
        </Panel>
      </div>
      <LogMaintenanceModal open={log} machineId={machine.id} onClose={() => setLog(false)} />
    </>
  );
}
