import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, Card, Empty, PageHeader, Segmented, cn } from '../components/ui';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { fmtDate } from '../lib/format';
import type { MaintenanceRecord } from '../types';

const BADGE: Record<MaintenanceRecord['status'], string> = {
  Completed: 'border-ok/40 bg-ok/10 text-ok',
  'In Progress': 'border-warn/40 bg-warn/10 text-warn',
  Scheduled: 'border-info/40 bg-info/10 text-info',
};

export default function Maintenance() {
  const { maintenance, machines, getMachine } = usePlant();
  const { can } = useAuth();
  const [machine, setMachine] = useState('all');
  const [status, setStatus] = useState<'all' | MaintenanceRecord['status']>('all');
  const [open, setOpen] = useState(false);
  const list = maintenance.filter((r) => (machine === 'all' || r.machineId === machine) && (status === 'all' || r.status === status)).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const cell = 'px-4 py-2.5 max-md:flex max-md:items-center max-md:justify-between max-md:gap-4 max-md:px-3 max-md:py-1.5 max-md:text-right max-md:before:shrink-0 max-md:before:text-left max-md:before:text-xs max-md:before:text-muted max-md:before:content-[attr(data-l)]';
  return (
    <>
      <PageHeader title="Maintenance History" sub={`${list.length} records · total ₹ ${list.reduce((a, r) => a + r.cost, 0).toLocaleString('en-IN')} · ${Math.round(list.reduce((a, r) => a + r.downtimeMin, 0) / 60 * 10) / 10} h downtime`} actions={can('maintenance-write') ? <Button variant="primary" onClick={() => setOpen(true)}><Plus size={15} />Log maintenance</Button> : undefined} />
      <div className="mb-4 flex flex-wrap gap-2">
        <select className="field w-auto" value={machine} onChange={(e) => setMachine(e.target.value)} aria-label="Machine"><option value="all">All machines</option>{machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <Segmented value={status} onChange={setStatus} label="Status" options={[{ value: 'all', label: 'All' }, { value: 'Completed', label: 'Completed' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Scheduled', label: 'Scheduled' }]} />
      </div>
      {list.length ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm max-md:block">
              <thead className="max-md:hidden"><tr className="border-b border-line text-left text-xs text-muted">{['Machine', 'Issue', 'Action taken', 'Parts', 'Technician', 'Date', 'Downtime', 'Cost', 'Status'].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody className="max-md:block max-md:space-y-2 max-md:p-2">
                {list.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 max-md:block max-md:rounded max-md:border max-md:bg-raised">
                    <td data-l="Machine" className={cell}><Link to={`/machines/${r.machineId}`} className="text-info hover:underline">{getMachine(r.machineId)?.name}</Link></td>
                    <td data-l="Issue" className={cell}>{r.issue}</td>
                    <td data-l="Action" className={cell}>{r.action}</td>
                    <td data-l="Parts" className={cell}>{r.parts}</td>
                    <td data-l="Technician" className={cell}>{r.technician}</td>
                    <td data-l="Date" className={cn(cell, 'num')}>{fmtDate(r.date)}</td>
                    <td data-l="Downtime" className={cn(cell, 'num')}>{r.downtimeMin ? `${r.downtimeMin} min` : '—'}</td>
                    <td data-l="Cost" className={cn(cell, 'num')}>{r.cost ? `₹ ${r.cost.toLocaleString('en-IN')}` : '—'}</td>
                    <td data-l="Status" className={cell}><span className={cn('whitespace-nowrap rounded border px-2 py-0.5 text-xs font-semibold', BADGE[r.status])}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : <Empty title="No maintenance records" text="Try a different machine or status, or log a new work order." />}
      <LogMaintenanceModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
