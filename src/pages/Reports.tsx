import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Button, Card, Empty, PageHeader, Panel } from '../components/ui';
import { usePlant } from '../context/PlantContext';
import { useToast } from '../context/ToastContext';
import { DIAGNOSIS, worstParam } from '../lib/engine';
import { fmtDate } from '../lib/format';

type ReportType = 'health' | 'maintenance' | 'downtime' | 'sensor' | 'monthly';
const TYPES: { id: ReportType; label: string }[] = [
  { id: 'health', label: 'Machine Health Report' },
  { id: 'maintenance', label: 'Maintenance Report' },
  { id: 'downtime', label: 'Downtime Report' },
  { id: 'sensor', label: 'Sensor Report' },
  { id: 'monthly', label: 'Monthly Plant Report' },
];
interface Table { head: string[]; rows: (string | number)[][]; note?: string[] }

export default function Reports() {
  const { machines, maintenance, sensors, statusOf, healthOf, thresholds, getMachine, settings } = usePlant();
  const { toast } = useToast();
  const [type, setType] = useState<ReportType>('health');
  const [format, setFormat] = useState<'CSV' | 'HTML'>('CSV');
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<{ type: ReportType; at: number } | null>(null);

  const build = (t: ReportType): Table => {
    if (t === 'health') return { head: ['Machine', 'Health', 'Status', 'Primary concern'], rows: machines.map((m) => [m.name, `${healthOf(m)}%`, statusOf(m), statusOf(m) === 'healthy' ? '—' : DIAGNOSIS[worstParam(m, thresholds)].what]) };
    if (t === 'maintenance') return { head: ['Work order', 'Machine', 'Issue', 'Technician', 'Date', 'Cost (₹)', 'Status'], rows: maintenance.map((r) => [r.id, getMachine(r.machineId)?.name ?? r.machineId, r.issue, r.technician, fmtDate(r.date), r.cost.toLocaleString('en-IN'), r.status]) };
    if (t === 'downtime') {
      const by: Record<string, number> = {};
      maintenance.forEach((r) => { by[r.machineId] = (by[r.machineId] ?? 0) + r.downtimeMin; });
      return { head: ['Machine', 'Downtime (min)'], rows: Object.entries(by).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => [getMachine(k)?.name ?? k, v]) };
    }
    if (t === 'sensor') return { head: ['Sensor', 'Machine', 'Battery', 'Status'], rows: sensors.filter((s) => s.state !== 'online').map((s) => [s.id, getMachine(s.machineId)?.name ?? s.machineId, `${s.battery}%`, s.state]) };
    const c = { healthy: 0, warning: 0, critical: 0 };
    machines.forEach((m) => { c[statusOf(m)]++; });
    return { head: ['Metric', 'Value'], rows: [['Machines monitored', machines.length], ['Healthy', c.healthy], ['At risk', c.warning], ['Critical', c.critical], ['Preventive maintenance compliance', '91%'], ['Unplanned downtime vs last month', '−18%']], note: ['Air Compressor 04 shows increasing vibration trends.'] };
  };

  const generate = () => {
    setBusy(true); setReport(null);
    setTimeout(() => { setReport({ type, at: Date.now() }); setBusy(false); toast('Report ready to preview.'); }, 900);
  };

  const download = () => {
    if (!report) return;
    const t = build(report.type);
    const title = TYPES.find((x) => x.id === report.type)!.label;
    let body: string; let mime: string; let ext: string;
    if (format === 'CSV') {
      body = [t.head, ...t.rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      mime = 'text/csv'; ext = 'csv';
    } else {
      body = `<!doctype html><meta charset="utf-8"><title>${title}</title><style>body{font:14px system-ui;padding:24px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ccc;padding:6px 8px;text-align:left}</style><h2>${title}</h2><p>${settings.plantName} · ${new Date(report.at).toLocaleString('en-GB')}</p><table><thead><tr>${t.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      mime = 'text/html'; ext = 'html';
    }
    const url = URL.createObjectURL(new Blob([body], { type: mime }));
    const a = document.createElement('a');
    a.href = url; a.download = `yantra-kavach-${report.type}.${ext}`; a.click();
    URL.revokeObjectURL(url);
    toast(`${title} downloaded.`);
  };

  const table = report ? build(report.type) : null;
  return (
    <>
      <PageHeader title="Reports" sub="Generate a report, preview it, then download." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel title="Report type">
          <div className="space-y-2.5">
            {TYPES.map((t) => <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm"><input type="radio" name="rt" checked={type === t.id} onChange={() => setType(t.id)} />{t.label}</label>)}
          </div>
          <label className="mt-4 flex flex-col gap-1.5"><span className="label">Download format</span>
            <select className="field" value={format} onChange={(e) => setFormat(e.target.value as 'CSV' | 'HTML')}><option>CSV</option><option>HTML</option></select></label>
          <Button variant="primary" className="mt-4 w-full" onClick={generate} disabled={busy}>{busy ? 'Generating…' : 'Generate Report'}</Button>
        </Panel>
        <Panel title="Preview">
          {busy ? <div className="h-56 animate-blink rounded bg-raised" /> : report && table ? (
            <>
              <Card className="bg-white p-5 text-[#1a1f24]">
                <h3 className="text-xl font-semibold">{TYPES.find((x) => x.id === report.type)?.label}</h3>
                <p className="mb-3 text-xs text-[#5d6873]">{settings.plantName} · Generated {new Date(report.at).toLocaleString('en-GB')}</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-[13px]">
                    <thead><tr className="text-left text-xs text-[#5d6873]">{table.head.map((h) => <th key={h} className="border-b border-[#d7dce0] py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
                    <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-[#e6e9ec] py-2 pr-3">{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                {table.note?.map((n) => <p key={n} className="mt-3 text-[13px]">{n}</p>)}
              </Card>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" onClick={download}><Download size={15} />Download {format}</Button>
                <Button onClick={() => window.print()}><Printer size={15} />Print / Save as PDF</Button>
              </div>
            </>
          ) : <Empty title="No report yet" text="Choose a report type and select Generate Report." />}
        </Panel>
      </div>
    </>
  );
}
