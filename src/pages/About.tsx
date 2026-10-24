import { Link } from 'react-router-dom';
import { Architecture } from '../components/Architecture';
import { Button, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Sensors', 'Data', 'AI', 'Anomaly Detection', 'Prediction', 'Alert', 'Maintenance'];

export default function About() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <span className="font-mono text-xs font-medium text-brand">ABOUT YANTRA KAVACH</span>
      <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">Machine-health monitoring a small workshop can afford.</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5"><h3 className="text-xl font-semibold">The problem</h3><p className="mt-2 text-muted">Legacy MSMEs lack affordable machine monitoring. Without it, maintenance is reactive—“run to failure”—which means unexpected breakdowns, lost production and expensive emergency repairs. Existing industrial IoT systems are costly, complicated to install and often need major modifications to the machine.</p></Card>
        <Card className="p-5"><h3 className="text-xl font-semibold">Our solution</h3><p className="mt-2 text-muted">Retrofit IoT, Edge AI and predictive maintenance. Sensors attach to existing machines and read vibration, temperature, sound, voltage and current. Edge AI compares live behaviour with each machine's own baseline and warns early.</p></Card>
      </div>
      <Card className="mt-4 p-5">
        <h3 className="text-xl font-semibold">How it works</h3>
        <ol className="mt-4 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4 lg:grid-cols-7">
          {STEPS.map((s, i) => <li key={s} className="bg-surface p-3 font-mono text-xs font-semibold uppercase"><span className="text-brand">{i + 1}</span> {s}</li>)}
        </ol>
      </Card>
      <Card className="mt-4 p-5">
        <h3 className="text-xl font-semibold">Retrofit vs. a conventional industrial IoT rollout</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2"></th><th>Yantra Kavach</th><th>Conventional IIoT</th></tr></thead>
            <tbody className="divide-y divide-line">
              {[['Installation', 'Sensors attach externally', 'Often needs machine or PLC integration'], ['Downtime to install', 'Minimal', 'Planned shutdown typical'], ['Target user', 'Small and medium manufacturers', 'Large plants with IT teams'], ['Output', 'What / where / why / action', 'Raw dashboards and scores']].map((r) => (
                <tr key={r[0]}><td className="py-2.5 font-medium">{r[0]}</td><td>{r[1]}</td><td className="text-muted">{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="mt-4 p-5"><h3 className="text-xl font-semibold">Who we serve</h3><p className="mt-2 text-muted">Small and medium-scale manufacturing industries: machining shops, press and forging units, plastics and packaging lines, and pump and compressor users.</p></Card>
      <h2 className="mb-6 mt-14 text-center text-3xl font-semibold">Architecture</h2>
      <Architecture />
      <div className="mt-10 text-center"><Link to={user ? '/dashboard' : '/login'}><Button variant="primary" className="h-11 px-6">View Live Dashboard</Button></Link></div>
    </div>
  );
}
