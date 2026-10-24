import { useEffect, useState } from 'react';
import { Panel, PageHeader, Segmented, LoadingState, Card } from '../components/ui';
import { BarsChart, Donut, MultiLine } from '../components/charts';
import { usePlant } from '../context/PlantContext';
import { api } from '../services/api';
import { buildAnalytics } from '../lib/mock';
import type { AnalyticsData, AnalyticsRange } from '../lib/mock';

export default function Analytics() {
  const { machines, statusOf } = usePlant();
  const [range, setRange] = useState<AnalyticsRange>('30D');
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    api.analytics<AnalyticsData>(range, () => buildAnalytics(range)).then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [range]);

  const c = { healthy: 0, warning: 0, critical: 0 };
  machines.forEach((m) => { c[statusOf(m)]++; });
  const bars = (vals: number[], labels: string[]) => vals.map((value, i) => ({ label: labels[i], value }));
  const lines = (labels: string[], s: Record<string, number[]>) => labels.map((label, i) => ({ label, ...Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v[i]])) }));

  return (
    <>
      <PageHeader title="Analytics" sub={`Plant performance over the last ${range === '7D' ? '7 days' : range === '30D' ? '30 days' : '90 days'}`}
        actions={<Segmented value={range} onChange={setRange} label="Date range" options={[{ value: '7D', label: '7D' }, { value: '30D', label: '30D' }, { value: '90D', label: '90D' }]} />} />
      <Panel title="Operational insights" className="mb-4">
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          <li>Unplanned downtime decreased by 18% this month.</li>
          <li>Air Compressor 04 shows increasing vibration trends.</li>
          <li>Preventive maintenance compliance: 91%.</li>
          <li>{c.warning + c.critical} machines currently outside normal range; {c.critical} need immediate attention.</li>
        </ul>
      </Panel>
      {!data ? <LoadingState label="Loading analytics…" /> : (
        <>
        <section aria-label="Reliability metrics" className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            ['OEE', `${data.kpi.oee.toFixed(1)}%`, 'Overall equipment effectiveness'],
            ['MTBF', `${Math.round(data.kpi.mtbfHours)} h`, 'Mean time between failures'],
            ['MTTR', `${data.kpi.mttrHours.toFixed(1)} h`, 'Mean time to repair'],
            ['Planned work', `${data.kpi.planned}%`, 'Preventive vs. reactive work orders'],
            ['Downtime cost avoided', `₹ ${(data.kpi.costAvoided / 100000).toFixed(1)} L`, 'Estimated, from early warnings'],
          ].map(([k, v, d]) => (
            <Card key={k} className="p-4"><div className="flex items-center justify-between"><span className="label">{k}</span></div><div className="num mt-1 font-display text-3xl font-semibold leading-none">{v}</div><div className="mt-1.5 text-xs text-muted">{d}</div></Card>
          ))}
        </section>
        <div className="mb-3 text-xs text-muted">Energy cost this period (₹7.60/kWh): <b className="num text-ink">₹ {data.kpi.energyCost.toLocaleString('en-IN')}</b></div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Machine uptime (%)"><BarsChart data={bars(data.uptime, data.labels)} color="#16a34a" unit="%" decimals={1} /></Panel>
          <Panel title="Downtime (hours)"><BarsChart data={bars(data.downtime, data.labels)} color="#d97706" unit=" h" decimals={1} /></Panel>
          <Panel title="Failure events"><BarsChart data={bars(data.failures, data.labels)} color="#dc2626" /></Panel>
          <Panel title="Energy consumption (kWh)"><BarsChart data={bars(data.energy, data.labels)} color="#0891b2" /></Panel>
          <Panel title="Temperature trends (°C)">
            <MultiLine decimals={0} data={lines(data.labels, data.temp)} series={[{ key: 'cnc', name: 'CNC Machine 01', color: '#16a34a' }, { key: 'press', name: 'Hydraulic Press 02', color: '#d97706' }, { key: 'motor', name: 'Motor Assembly 03', color: '#dc2626' }]} />
          </Panel>
          <Panel title="Vibration trends (mm/s)">
            <MultiLine data={lines(data.labels, data.vib)} series={[{ key: 'cnc', name: 'CNC Machine 01', color: '#16a34a' }, { key: 'press', name: 'Hydraulic Press 02', color: '#d97706' }, { key: 'compressor', name: 'Air Compressor 04', color: '#dc2626' }]} />
          </Panel>
          <Panel title="Maintenance frequency"><BarsChart data={bars(data.maintenance, data.labels)} color="#ea580c" /></Panel>
          <Panel title="Machine health distribution"><Donut data={[{ name: 'Healthy', value: c.healthy, color: '#16a34a' }, { name: 'At risk', value: c.warning, color: '#d97706' }, { name: 'Critical', value: c.critical, color: '#dc2626' }]} /></Panel>
        </div>
        </>
      )}
    </>
  );
}
