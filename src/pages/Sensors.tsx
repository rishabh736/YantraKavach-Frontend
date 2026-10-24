import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, Card, Empty, PageHeader, cn } from '../components/ui';
import { usePlant } from '../context/PlantContext';
import { PARAMS, PARAM_KEYS, fmtValue } from '../lib/params';
import type { ParamKey, Sensor } from '../types';

function Signal({ rssi }: { rssi: number }) {
  const bars = rssi > -55 ? 4 : rssi > -65 ? 3 : rssi > -75 ? 2 : rssi > -95 ? 1 : 0;
  const text = rssi > -65 ? 'Strong' : rssi > -80 ? 'Fair' : rssi > -95 ? 'Weak' : 'None';
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 5} y={11 - i * 3} width="3" height={3 + i * 3} className={i < bars ? 'fill-ok' : 'fill-line'} />)}</svg>
      <span className="text-xs text-muted">{text}</span>
    </span>
  );
}

const STATE: Record<Sensor['state'], { label: string; cls: string }> = {
  online: { label: 'Online', cls: 'border-ok/40 bg-ok/10 text-ok' },
  'low-battery': { label: 'Low battery', cls: 'border-warn/40 bg-warn/10 text-warn' },
  offline: { label: 'Offline', cls: 'border-crit/40 bg-crit/10 text-crit' },
};

export default function Sensors() {
  const { sensors, machines, getMachine } = usePlant();
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | ParamKey>('all');
  const [state, setState] = useState<'all' | Sensor['state']>('all');
  const [more, setMore] = useState(false);

  const list = sensors.filter((s) => (`${getMachine(s.machineId)?.name} ${s.id}`).toLowerCase().includes(q.toLowerCase()) && (type === 'all' || s.param === type) && (state === 'all' || s.state === state));
  const shown = more ? list : list.slice(0, 15);
  const online = sensors.filter((s) => s.state === 'online').length;

  return (
    <>
      <PageHeader title="Sensor Network" sub={`${online} of ${sensors.length} sensors online · gateway heartbeat OK`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] max-w-sm flex-1"><Search size={16} className="absolute left-3 top-3 text-muted" /><input className="field pl-9" placeholder="Search sensor or machine" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search sensors" /></div>
        <select className="field w-auto" value={type} onChange={(e) => setType(e.target.value as 'all' | ParamKey)} aria-label="Type"><option value="all">All types</option>{PARAM_KEYS.map((k) => <option key={k} value={k}>{PARAMS[k].label}</option>)}</select>
        <select className="field w-auto" value={state} onChange={(e) => setState(e.target.value as 'all' | Sensor['state'])} aria-label="Status"><option value="all">All statuses</option><option value="online">Online</option><option value="low-battery">Low battery</option><option value="offline">Offline</option></select>
      </div>
      {list.length ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm max-sm:block">
              <thead className="max-sm:hidden"><tr className="border-b border-line text-left text-xs text-muted">{['Sensor ID', 'Machine', 'Type', 'Current value', 'Battery', 'Signal', 'Status'].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody className="max-sm:block max-sm:space-y-2 max-sm:p-2">
                {shown.map((s) => {
                  const m = getMachine(s.machineId);
                  const off = s.state === 'offline';
                  const cell = 'px-4 py-2.5 max-sm:flex max-sm:items-center max-sm:justify-between max-sm:px-3 max-sm:py-1.5 max-sm:before:text-xs max-sm:before:text-muted max-sm:before:content-[attr(data-l)]';
                  return (
                    <tr key={s.id} className="border-b border-line last:border-0 max-sm:block max-sm:rounded max-sm:border max-sm:bg-raised">
                      <td data-l="Sensor ID" className={cn(cell, 'num')}>{s.id}</td>
                      <td data-l="Machine" className={cell}><Link to={`/machines/${s.machineId}`} className="text-info hover:underline">{m?.name}</Link></td>
                      <td data-l="Type" className={cell}>{PARAMS[s.param].label}</td>
                      <td data-l="Value" className={cn(cell, 'num')}>{off || !m ? '—' : `${fmtValue(s.param, m.readings[s.param])} ${PARAMS[s.param].unit}`}</td>
                      <td data-l="Battery" className={cn(cell, 'num', s.battery > 0 && s.battery < 25 && 'text-crit')}>{off ? '—' : `${s.battery}%`}</td>
                      <td data-l="Signal" className={cell}><Signal rssi={s.rssi} /></td>
                      <td data-l="Status" className={cell}><span className={cn('rounded border px-2 py-0.5 text-xs font-semibold', STATE[s.state].cls)}>{STATE[s.state].label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : <Empty title="No sensors match" text="Adjust the search or filters." />}
      {list.length > 15 && <div className="mt-4 text-center"><Button onClick={() => setMore(!more)}>{more ? 'Show fewer' : `Show all ${list.length}`}</Button></div>}
    </>
  );
}
