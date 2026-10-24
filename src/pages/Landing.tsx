import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Cpu, Radio, BrainCircuit, ScanSearch, BellRing, ShieldCheck, Wrench, Gauge, ClipboardCheck, LineChart } from 'lucide-react';
import { Architecture } from '../components/Architecture';
import { Button, Card, LiveBadge, StatusBadge } from '../components/ui';
import { Sparkline } from '../components/Sparkline';
import { TrustSection } from '../components/TrustSection';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { useA11y } from '../context/A11yContext';
import { DEFAULT_THRESHOLDS, PARAM_KEYS, PARAMS, fmtValue } from '../lib/params';
import { buildSeries } from '../lib/mock';
import { predict } from '../lib/engine';

const FLOW = [
  { icon: Cpu, t: 'Machine', d: 'Existing legacy asset' },
  { icon: Radio, t: 'Sensors', d: 'Clamp-on, no rewiring' },
  { icon: BrainCircuit, t: 'Edge AI', d: 'Local processing' },
  { icon: ScanSearch, t: 'Anomaly detection', d: 'Baseline vs live' },
  { icon: BellRing, t: 'Early warning', d: 'Alert with action' },
];

function HeroConsole() {
  const { machines, statusOf, healthOf, ready } = usePlant();
  const rows = machines.slice(0, 3);
  const counts = useMemo(() => ({
    h: machines.filter((m) => statusOf(m) === 'healthy').length,
    w: machines.filter((m) => statusOf(m) === 'warning').length,
    c: machines.filter((m) => statusOf(m) === 'critical').length,
  }), [machines, statusOf]);
  if (!ready) return <div className="h-[400px] rounded-md border border-line bg-surface" />;
  const focus = machines[2];
  const spark = buildSeries(focus.id, 'vibration', '6H', focus.readings.vibration, focus.baseline.vibration, true).filter((_, i) => i % 3 === 0).map((p) => p.v);
  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-raised px-4 py-2.5">
        <span className="font-display text-sm font-semibold tracking-widest">PLANT OVERVIEW</span>
        <LiveBadge />
      </div>
      <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center">
        {[['Healthy', counts.h, 'text-ok'], ['At risk', counts.w, 'text-warn'], ['Critical', counts.c, 'text-crit']].map(([l, v, c]) => (
          <div key={l as string} className="py-3"><div className={`font-display text-3xl font-bold ${c}`}>{v}</div><div className="text-xs text-muted">{l}</div></div>
        ))}
      </div>
      <ul className="divide-y divide-line">
        {rows.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <div className="min-w-0"><div className="truncate font-medium">{m.name}</div><div className="num text-xs text-muted">{fmtValue('temperature', m.readings.temperature)}°C · {fmtValue('vibration', m.readings.vibration)} mm/s · {healthOf(m)}%</div></div>
            <StatusBadge status={statusOf(m)} />
          </li>
        ))}
      </ul>
      <div className="border-t border-line p-4">
        <div className="mb-1 flex items-center justify-between text-xs"><span className="text-muted">Vibration trend · {focus.name}</span><span className="num text-crit">{fmtValue('vibration', focus.readings.vibration)} mm/s</span></div>
        <Sparkline values={spark} color="rgb(var(--crit))" height={56} />
        <div className="mt-2 rounded border border-crit/40 bg-crit/10 px-3 py-2 text-xs"><b className="text-crit">CRITICAL</b> · {predict(focus, DEFAULT_THRESHOLDS).action}</div>
      </div>
    </Card>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const { machines } = usePlant();
  const { t, lang } = useA11y();
  const loc = useLocation();
  const cta = user ? '/dashboard' : '/login';
  const m1 = machines[0];

  useEffect(() => {
    const id = (loc.state as { scrollTo?: string } | null)?.scrollTo;
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [loc.state]);

  return (
    <>
      <section className="relative border-b border-line bg-bg" style={{ backgroundImage: 'linear-gradient(rgb(var(--line)/.45) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--line)/.45) 1px,transparent 1px)', backgroundSize: '44px 44px' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded border border-brand/50 bg-surface px-2.5 py-1 font-mono text-[11px] font-medium text-brand"><ShieldCheck size={13} />{t('MISSION CONTROL FOR INDUSTRIAL MACHINES')}</span>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.05] sm:text-6xl">
              {lang === 'en' ? <>Turn Legacy Machines Into <span className="text-brand">Smart Machines.</span></> : t('Turn Legacy Machines Into Smart Machines.')}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{t('Yantra Kavach brings affordable AI-powered predictive maintenance to MSMEs—without replacing existing machinery.')}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={cta}><Button variant="primary" className="h-11 px-6">{t('View Live Dashboard')}<ArrowRight size={16} /></Button></Link>
              <Button className="h-11 px-6" onClick={() => document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' })}>{t('Explore Technology')}</Button>
            </div>
            <ol className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-5" aria-label="Workflow">
              {FLOW.map((f, i) => (
                <li key={f.t} className="bg-surface p-3">
                  <f.icon size={16} className="text-brand" />
                  <div className="mt-2 font-mono text-[11px] font-semibold uppercase leading-tight">{i + 1}. {f.t}</div>
                  <div className="mt-0.5 text-[11px] text-muted">{f.d}</div>
                </li>
              ))}
            </ol>
          </div>
          <HeroConsole />
        </div>
      </section>

      <section className="border-b border-line bg-surface" aria-label="Key metrics">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-line lg:grid-cols-4">
          {[['24/7', 'Monitoring'], ['5+', 'Machine parameters'], ['Real-time', 'Anomaly detection'], ['Retrofit', 'Friendly installation']].map(([v, l]) => (
            <div key={l} className="px-4 py-6 sm:px-6"><div className="font-display text-3xl font-bold">{v}</div><div className="text-sm text-muted">{t(l)}</div></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { i: Wrench, n: '1', h: 'Attach sensors', p: 'Clamp-on and magnetic-mount sensors go on the outside of the machine. No rewiring, no rebuild, minimal stoppage.' },
            { i: LineChart, n: '2', h: 'Learn the baseline', p: 'The system learns how each machine normally behaves, so “abnormal” is judged against that machine, not a generic limit.' },
            { i: ClipboardCheck, n: '3', h: 'Get early, clear warnings', p: 'When behaviour drifts, technicians get a plain-language alert: what, where, why, impact and action.' },
          ].map((s) => (
            <Card key={s.h} className="p-5">
              <div className="flex items-center justify-between"><s.i size={22} className="text-brand" /><span className="font-mono text-sm text-muted">STEP {s.n}</span></div>
              <h3 className="mt-3 text-xl font-semibold">{s.h}</h3>
              <p className="mt-1 text-sm text-muted">{s.p}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="technology" className="scroll-mt-28 border-y border-line bg-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">{t('One System. Complete Machine Visibility.')}</h2>
          <p className="mt-2 max-w-2xl text-muted">Five parameters, read together. A single reading rarely tells you a machine is failing—the pattern across readings does. Values below are live readings from CNC Machine 01.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PARAM_KEYS.map((k) => {
              const P = PARAMS[k];
              const spark = m1 ? buildSeries(m1.id, k, '6H', m1.readings[k], m1.baseline[k], false).filter((_, i) => i % 3 === 0).map((p) => p.v) : [];
              return (
                <Card key={k} className="p-4">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-medium" style={{ color: P.color }}><P.icon size={18} /><span className="text-ink">{P.label}</span></span><span className="h-2 w-2 rounded-full bg-ok" title="Normal" /></div>
                  <div className="num mt-3 text-2xl font-medium">{m1 ? fmtValue(k, m1.readings[k]) : '—'} <span className="text-sm text-muted">{P.unit}</span></div>
                  <Sparkline values={spark} color={P.color} />
                  <p className="mt-2 text-[13px] text-muted">{P.blurb}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">Not just a score. A reason and an action.</h2>
          <p className="mt-3 text-muted">Every prediction explains what was detected, where, why it matters and what a technician should do—with a confidence figure, so the team can trust it.</p>
          <ul className="mt-5 space-y-2 text-sm text-muted">
            <li className="flex gap-2"><Gauge size={16} className="mt-0.5 shrink-0 text-brand" />Compares each machine with its own baseline, not a generic limit.</li>
            <li className="flex gap-2"><Wrench size={16} className="mt-0.5 shrink-0 text-brand" />Turns a warning into a specific maintenance instruction.</li>
          </ul>
        </div>
        <Card className="p-5">
          <div className="mb-3 font-display text-lg font-semibold">Why is Hydraulic Press 02 at risk?</div>
          <dl className="divide-y divide-line text-sm">
            {[['WHAT', 'Abnormal vibration detected.'], ['WHERE', 'Drive-end bearing region.'], ['WHY', 'Vibration amplitude has increased by 31% over the baseline.'], ['IMPACT', 'Potential bearing degradation.'], ['ACTION', 'Inspect bearing lubrication and alignment.']].map(([a, b]) => (
              <div key={a} className="grid grid-cols-[84px_1fr] gap-3 py-2.5"><dt className="font-mono text-xs font-semibold text-brand">{a}</dt><dd>{b}</dd></div>
            ))}
          </dl>
          <div className="mt-2 flex items-center justify-between text-xs"><span className="text-muted">AI Confidence</span><b className="num">87%</b></div>
          <div className="mt-1 h-1.5 rounded-sm bg-raised"><div className="h-full w-[87%] rounded-sm bg-info" /></div>
        </Card>
      </section>

      <section className="border-t border-line bg-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-semibold sm:text-4xl">{t('System architecture')}</h2>
          <Architecture />
        </div>
      </section>

      <TrustSection />

      <section className="border-t border-line bg-surface py-16 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t('Protecting Machines. Preventing Downtime.')}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">Open the plant dashboard and see what a technician sees at 8 a.m.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={cta}><Button variant="primary" className="h-11 px-6">{t('View Live Dashboard')}<ArrowRight size={16} /></Button></Link>
          <Link to="/contact"><Button className="h-11 px-6">Book a site visit</Button></Link>
        </div>
      </section>
    </>
  );
}
