import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button, Card, ErrorNote, Field } from '../components/ui';
import { UtilityBar } from '../components/UtilityBar';
import { DEMO_PASSWORD, DEMO_USERS, useAuth } from '../context/AuthContext';
import type { Role } from '../types';

export default function Login() {
  const { user, login, signup } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const err = mode === 'login'
      ? login(email, pw, f.get('remember') === 'on')
      : signup(String(f.get('name') ?? ''), email, pw, String(f.get('role')) as Role);
    if (err) setError(err); else nav('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface">
    <UtilityBar />
    <main id="main" tabIndex={-1} className="grid min-h-[calc(100vh-33px)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-10">
        <form onSubmit={submit} noValidate className="w-full max-w-sm space-y-4">
          <Link to="/"><Logo /></Link>
          <h1 className="pt-4 text-3xl font-semibold">{mode === 'login' ? 'Log in' : 'Create account'}</h1>
          {error && <ErrorNote>{error}</ErrorNote>}
          {mode === 'signup' && <Field label="Full name"><input name="name" className="field" autoComplete="name" /></Field>}
          <Field label="Email"><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
          <Field label="Password"><input className="field" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></Field>
          {mode === 'signup' ? (
            <Field label="Role"><select name="role" className="field">{DEMO_USERS.map((u) => <option key={u.role}>{u.role}</option>)}</select></Field>
          ) : (
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="remember" defaultChecked /> Remember me</label>
          )}
          <Button variant="primary" type="submit" className="w-full">{mode === 'login' ? 'Log in' : 'Create account'}</Button>
          <button type="button" className="text-sm text-info hover:underline" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
          </button>
        </form>
      </div>
      <div className="flex flex-col justify-center gap-3 border-t border-line bg-bg px-6 py-10 lg:border-l lg:border-t-0 lg:px-12">
        <h2 className="text-2xl font-semibold">Quick access</h2>
        <p className="text-sm text-muted">Password for all accounts: <b className="num text-ink">{DEMO_PASSWORD}</b>. Each role sees a different interface.</p>
        {DEMO_USERS.map((u) => (
          <Card key={u.email} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0"><div className="font-medium">{u.role}</div><div className="num truncate text-xs text-muted">{u.email}</div></div>
            <Button size="sm" onClick={() => { setEmail(u.email); setPw(DEMO_PASSWORD); setError(''); setMode('login'); }}>Use</Button>
          </Card>
        ))}
        <p className="text-xs text-muted">Admin: everything, including users and API. Maintenance Manager: plant, reports and thresholds. Operator: monitoring and alerts only.</p>
      </div>
    </main>
    </div>
  );
}
