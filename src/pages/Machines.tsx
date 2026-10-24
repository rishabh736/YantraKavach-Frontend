import { useState } from 'react';
import { Search } from 'lucide-react';
import { Empty, LiveBadge, PageHeader, Segmented } from '../components/ui';
import { MachineCard } from '../components/MachineCard';
import { usePlant } from '../context/PlantContext';
import { ZONES } from '../lib/mock';
import type { Status } from '../types';

export default function Machines() {
  const { machines, statusOf, healthOf } = usePlant();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [zone, setZone] = useState('all');
  const [sort, setSort] = useState<'name' | 'health'>('name');

  const list = machines
    .filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) && (status === 'all' || statusOf(m) === status) && (zone === 'all' || m.zone === zone))
    .sort((a, b) => (sort === 'health' ? healthOf(a) - healthOf(b) : a.name.localeCompare(b.name, undefined, { numeric: true })));

  return (
    <>
      <PageHeader title="Machine Monitoring" sub={`${list.length} of ${machines.length} machines`} actions={<LiveBadge />} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-3 text-muted" />
          <input className="field pl-9" placeholder="Search machine name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search machines" />
        </div>
        <Segmented value={status} onChange={setStatus} label="Status"
          options={[{ value: 'all', label: 'All' }, { value: 'healthy', label: 'Healthy' }, { value: 'warning', label: 'Warning' }, { value: 'critical', label: 'Critical' }]} />
        <select className="field w-auto" value={zone} onChange={(e) => setZone(e.target.value)} aria-label="Zone"><option value="all">All zones</option>{ZONES.map((z) => <option key={z}>{z}</option>)}</select>
        <select className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value as 'name' | 'health')} aria-label="Sort"><option value="name">Sort: name</option><option value="health">Sort: lowest health</option></select>
      </div>
      {list.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{list.map((m) => <MachineCard key={m.id} machine={m} />)}</div>
        : <Empty title="No machines match" text="Clear the search or choose a different status filter." />}
    </>
  );
}
