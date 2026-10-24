import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Button, Card, ErrorNote, Field } from '../components/ui';
import { SITE } from '../config/site';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { toast } = useToast();
  const [error, setError] = useState('');
  const [ref, setRef] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') ?? '').trim();
    const email = String(f.get('email') ?? '').trim();
    const msg = String(f.get('message') ?? '').trim();
    if (!name || !email || !msg) { setError('Please fill in your name, email and message.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address.'); return; }
    setError(''); setBusy(true);
    // Replace with: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(...) })
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setRef(`YK-${Math.floor(10000 + Math.random() * 89999)}`);
    toast('Message sent.');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Contact us</h1>
      <p className="mt-2 max-w-2xl text-muted">Ask a question, request a product walkthrough, or book a site visit to see how sensors attach to your machines.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          {ref ? (
            <div className="py-8 text-center" role="status">
              <CheckCircle2 size={36} className="mx-auto text-ok" />
              <h2 className="mt-3 text-2xl font-semibold">Thank you — we have your message</h2>
              <p className="mt-1 text-sm text-muted">Your reference is <b className="num text-ink">{ref}</b>. Our team will reply by email.</p>
              <Button className="mt-4" onClick={() => setRef('')}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              {error && <ErrorNote>{error}</ErrorNote>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name *"><input name="name" className="field" autoComplete="name" /></Field>
                <Field label="Work email *"><input name="email" type="email" className="field" autoComplete="email" /></Field>
                <Field label="Phone"><input name="phone" type="tel" className="field" autoComplete="tel" /></Field>
                <Field label="Company / plant"><input name="company" className="field" autoComplete="organization" /></Field>
              </div>
              <Field label="I would like to">
                <select name="topic" className="field"><option>See a product walkthrough</option><option>Book a site visit</option><option>Get pricing</option><option>Partner with you</option><option>Get support</option></select>
              </Field>
              <Field label="Message *"><textarea name="message" rows={5} className="field" /></Field>
              <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</Button>
            </form>
          )}
        </Card>
        <Card className="space-y-4 p-5 text-sm">
          <h2 className="text-xl font-semibold">Get in touch</h2>
          <div className="flex gap-3"><Mail size={16} className="mt-0.5 text-brand" /><div><div className="label">Email</div>{SITE.email}</div></div>
          <div className="flex gap-3"><Phone size={16} className="mt-0.5 text-brand" /><div><div className="label">Phone</div>{SITE.phone}</div></div>
          <div className="flex gap-3"><MapPin size={16} className="mt-0.5 text-brand" /><div><div className="label">Address</div>{SITE.address}</div></div>
          <div className="flex gap-3"><Clock size={16} className="mt-0.5 text-brand" /><div><div className="label">Hours</div>{SITE.hours}</div></div>
        </Card>
      </div>
    </div>
  );
}
