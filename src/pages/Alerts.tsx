import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button, Card, Empty, Field, Modal, PageHeader, Segmented, SeverityBadge, SEVERITY_STYLE, cn } from '../components/ui';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DIAGNOSIS } from '../lib/engine';
import { TECHNICIANS } from '../lib/mock';
import { ago } from '../lib/format';
import type { Alert, Severity } from '../types';

export default function Alerts() {
  const { alerts, getMachine, acknowledge, resolve, assign } = usePlant();
  const { can } = useAuth();
  const { toast } = useToast();
  const [sev, setSev] = useState<'all' | Severity>('all');
  const [state, setState] = useState<'active' | 'open' | 'acknowledged' | 'resolved' | 'all'>('active');
  const [assigning, setAssigning] = useState<Alert | null>(null);
  const [rec, setRec] = useState<Alert | null>(null);
  const [tech, setTech] = useState(TECHNICIANS[0]);

  const list = alerts.filter((a) => (sev === 'all' || a.severity === sev) && (state === 'all' || (state === 'active' ? a.status !== 'resolved' : a.status === state)));
  const active = alerts.filter((a) => a.status !== 'resolved');

  return (
    <>
      <PageHeader title="Alert Center" sub={`${active.length} active · ${active.filter((a) => a.severity === 'critical').length} critical`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Segmented value={sev} onChange={setSev} label="Severity" options={[{ value: 'all', label: 'All' }, { value: 'critical', label: '🔴 Critical' }, { value: 'high', label: '🟠 High Risk' }, { value: 'warning', label: '🟡 Warning' }, { value: 'info', label: '🟢 Info' }]} />
        <Segmented value={state} onChange={setState} label="Status" options={[{ value: 'active', label: 'Active' }, { value: 'open', label: 'New' }, { value: 'acknowledged', label: 'Acknowledged' }, { value: 'resolved', label: 'Resolved' }, { value: 'all', label: 'All' }]} />
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((a) => {
            const m = getMachine(a.machineId);
            return (
              <Card key={a.id} className={cn('border-l-4 p-4', SEVERITY_STYLE[a.severity].left)}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><SeverityBadge severity={a.severity} /><span className="num text-xs text-muted">{a.id} · {ago(a.createdAt)}{a.status === 'acknowledged' ? ' · Acknowledged' : ''}{a.status === 'resolved' ? ' · Resolved' : ''}{a.technician ? ` · ${a.technician}` : ''}</span></div>
                    <h3 className="mt-2 text-lg font-semibold">{m?.name}</h3>
                    <p className="text-sm text-muted">{a.message}</p>
                  </div>
                  {a.status !== 'resolved' && (
                    <div className="flex flex-wrap gap-2">
                      {a.status === 'open' && <Button size="sm" onClick={async () => { await acknowledge(a.id); toast('Alert acknowledged.'); }}><Check size={14} />Acknowledge</Button>}
                      {can('maintenance-write') && <>
                        <Button size="sm" onClick={() => setAssigning(a)}>Assign technician</Button>
                        <Button size="sm" onClick={() => { resolve(a.id); toast('Alert marked resolved.'); }}>Mark resolved</Button>
                      </>}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to={`/machines/${a.machineId}`}><Button size="sm" variant="ghost">View machine</Button></Link>
                  <Button size="sm" variant="ghost" onClick={() => setRec(a)}>View recommendation</Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : <Empty title="No alerts match" text="Change the severity or status filter to see more." />}

      <Modal open={!!assigning} title="Assign technician" onClose={() => setAssigning(null)}>
        <div className="space-y-3">
          <Field label="Technician"><select className="field" value={tech} onChange={(e) => setTech(e.target.value)}>{TECHNICIANS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Button variant="primary" className="w-full" onClick={() => { if (assigning) { assign(assigning.id, tech); toast(`${tech} assigned to ${assigning.id}.`); } setAssigning(null); }}>Assign</Button>
        </div>
      </Modal>
      <Modal open={!!rec} title={rec ? `Recommendation · ${getMachine(rec.machineId)?.name ?? ''}` : ''} onClose={() => setRec(null)}>
        {rec && (
          <dl className="divide-y divide-line text-sm">
            {[['WHAT', DIAGNOSIS[rec.param].what], ['WHERE', DIAGNOSIS[rec.param].where], ['IMPACT', DIAGNOSIS[rec.param].impact], ['ACTION', DIAGNOSIS[rec.param].action]].map(([a, b]) => (
              <div key={a} className="grid grid-cols-[84px_1fr] gap-3 py-2.5"><dt className="font-mono text-xs font-semibold text-brand">{a}</dt><dd>{b}</dd></div>
            ))}
          </dl>
        )}
      </Modal>
    </>
  );
}
