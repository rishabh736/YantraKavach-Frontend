import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, FileText, Lock, ShieldCheck, Users, Eye, KeyRound } from 'lucide-react';
import { Card } from './ui';
import { CREDENTIALS, PILOTS, TEAM } from '../config/site';
import { useA11y } from '../context/A11yContext';

const Pending = ({ text = 'To be added' }: { text?: string }) => (
  <span className="inline-block rounded border border-dashed border-line px-2 py-0.5 text-xs text-muted">{text}</span>
);

export function TrustSection() {
  const { t } = useA11y();
  return (
    <section id="trust" className="scroll-mt-24 border-t border-line bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t('Built on facts you can check')}</h2>
        <p className="mt-2 max-w-2xl text-muted">Registrations, people and results—shown only when they can be verified. Anything not yet available is marked “To be added” rather than invented.</p>

        <h3 className="mb-3 mt-10 flex items-center gap-2 text-lg font-semibold"><BadgeCheck size={18} className="text-brand" />Registrations &amp; recognitions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CREDENTIALS.map((c) => (
            <Card key={c.label} className="p-4">
              <div className="flex items-center gap-2 font-medium"><Building2 size={16} className="text-muted" />{c.label}</div>
              {c.number
                ? <div className="mt-2"><div className="num text-sm">{c.number}</div>{c.verifyUrl && <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="text-xs text-info underline">Verify online</a>}</div>
                : <div className="mt-2"><Pending /></div>}
              <p className="mt-2 text-xs text-muted">{c.detail}</p>
            </Card>
          ))}
        </div>

        <h3 className="mb-3 mt-10 flex items-center gap-2 text-lg font-semibold"><Users size={18} className="text-brand" />Team &amp; mentors</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <Card key={i} className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-raised font-display text-lg font-semibold text-muted">{m.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</div>
              <div className="min-w-0"><div className="truncate font-medium">{m.name}</div><div className="text-xs text-muted">{m.role}</div></div>
            </Card>
          ))}
        </div>

        <h3 className="mb-3 mt-10 flex items-center gap-2 text-lg font-semibold"><FileText size={18} className="text-brand" />Pilot results</h3>
        {PILOTS.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {PILOTS.map((p) => (
              <Card key={p.plant} className="p-4"><div className="font-medium">{p.plant}</div><p className="mt-1 text-sm">{p.result}</p>{p.quote && <blockquote className="mt-2 border-l-2 border-brand pl-3 text-sm text-muted">“{p.quote}”</blockquote>}</Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed p-5 text-sm text-muted">No pilot results published yet. Results will appear here, with the plant’s permission, as soon as a pilot is complete.</Card>
        )}

        <h3 className="mb-3 mt-10 flex items-center gap-2 text-lg font-semibold"><ShieldCheck size={18} className="text-brand" />Data &amp; security by design</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Eye, h: 'Monitoring only', p: 'Sensors read machine behaviour. Yantra Kavach never sends control signals to your machines.' },
            { i: KeyRound, h: 'Role-based access', p: 'Admin, Maintenance Manager and Operator roles limit who can change settings or reports.' },
            { i: Lock, h: 'Encrypted in transit', p: 'Deployments are served over HTTPS so data between sensors, server and browser is encrypted.' },
            { i: ShieldCheck, h: 'Your data stays yours', p: 'Plant data is used to run your service only. See the Privacy Policy for retention and your rights.' },
          ].map((x) => (
            <Card key={x.h} className="p-4"><x.i size={18} className="text-brand" /><div className="mt-2 font-medium">{x.h}</div><p className="mt-1 text-sm text-muted">{x.p}</p></Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Read our <Link to="/privacy" className="text-info underline">Privacy Policy</Link>, <Link to="/terms" className="text-info underline">Terms of Use</Link> and <Link to="/accessibility" className="text-info underline">Accessibility statement</Link>.</p>
      </div>
    </section>
  );
}
