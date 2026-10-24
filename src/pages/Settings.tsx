import { useState } from 'react';
import { Button, Card, ErrorNote, Field, PageHeader, Panel, cn } from '../components/ui';
import { DEMO_USERS, useAuth } from '../context/AuthContext';
import { usePlant } from '../context/PlantContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { DEFAULT_THRESHOLDS, PARAM_KEYS, PARAMS } from '../lib/params';
import type { Severity, Thresholds } from '../types';

type Tab = 'plant' | 'thresholds' | 'alerts' | 'notifications' | 'sensors' | 'users' | 'api';

export default function Settings() {
  const { can } = useAuth();
  const { settings, setSettings, thresholds, setThresholds, sensors, apiMode } = usePlant();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('plant');
  const [apiError, setApiError] = useState('');
  const tabs: { id: Tab; label: string }[] = [
    { id: 'plant', label: 'Plant' }, { id: 'thresholds', label: 'Machine thresholds' }, { id: 'alerts', label: 'Alert preferences' },
    { id: 'notifications', label: 'Notifications' }, { id: 'sensors', label: 'Sensor configuration' },
    ...(can('users') ? [{ id: 'users' as Tab, label: 'User management' }, { id: 'api' as Tab, label: 'API configuration' }] : []),
  ];
  const save = <K extends keyof typeof settings>(k: K, v: (typeof settings)[K]) => setSettings({ ...settings, [k]: v });
  const setTh = (k: keyof Thresholds, level: 'warn' | 'crit', raw: string) => {
    const v = parseFloat(raw);
    if (!isNaN(v) && v > 0) setThresholds({ ...thresholds, [k]: { ...thresholds[k], [level]: v } });
  };
  const toggle = (k: 'notifyPush' | 'notifyEmail' | 'notifySms' | 'digest', label: string) => (
    <label key={k} className="flex items-center justify-between border-b border-line py-3 text-sm last:border-0">
      <span>{label}</span><input type="checkbox" checked={settings[k]} onChange={(e) => { save(k, e.target.checked); toast('Setting saved.', 'info'); }} />
    </label>
  );
  const test = async () => {
    setApiError('');
    if (!settings.apiUrl) { setApiError('Enter an API base URL first.'); return; }
    try { await api.testConnection(); toast('API connection successful.'); }
    catch { setApiError(`Could not reach ${settings.apiUrl}. Check the URL, CORS settings and API key. The app keeps using its built-in sample data.`); }
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={cn('whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium', tab === t.id ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink')}>{t.label}</button>
        ))}
      </div>
      <Panel>
        {tab === 'plant' && <div className="max-w-md"><Field label="Plant name"><input className="field" value={settings.plantName} onChange={(e) => save('plantName', e.target.value)} /></Field></div>}
        {tab === 'thresholds' && (
          <>
            <p className="mb-4 text-sm text-muted">Warning at or above the first value; critical above the second. Changes apply to the live dashboard immediately. Voltage is % deviation from 415 V.</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {PARAM_KEYS.map((k) => (
                <Card key={k} className="p-4">
                  <h4 className="mb-3 text-base font-semibold" style={{ color: PARAMS[k].color }}>{PARAMS[k].label} <span className="text-xs font-normal text-muted">({k === 'voltage' ? '% dev' : PARAMS[k].unit})</span></h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Warning"><input className="field" type="number" step="any" value={thresholds[k].warn} onChange={(e) => setTh(k, 'warn', e.target.value)} /></Field>
                    <Field label="Critical"><input className="field" type="number" step="any" value={thresholds[k].crit} onChange={(e) => setTh(k, 'crit', e.target.value)} /></Field>
                  </div>
                </Card>
              ))}
            </div>
            <Button className="mt-4" onClick={() => { setThresholds(DEFAULT_THRESHOLDS); toast('Thresholds restored to defaults.', 'info'); }}>Restore defaults</Button>
          </>
        )}
        {tab === 'alerts' && (
          <div className="max-w-sm"><Field label="Minimum severity to notify">
            <select className="field" value={settings.minSeverity} onChange={(e) => save('minSeverity', e.target.value as Severity)}>
              <option value="info">Information</option><option value="warning">Warning</option><option value="high">High Risk</option><option value="critical">Critical</option>
            </select></Field></div>
        )}
        {tab === 'notifications' && <div className="max-w-md">{toggle('notifyPush', 'In-app toast notifications')}{toggle('notifyEmail', 'Email notifications')}{toggle('notifySms', 'SMS for critical alerts')}{toggle('digest', 'Daily maintenance digest')}</div>}
        {tab === 'sensors' && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {PARAM_KEYS.map((k) => (
              <Card key={k} className="p-4"><h4 className="text-base font-semibold">{PARAMS[k].label}</h4>
                <p className="mt-1 text-sm text-muted">Sampling: {k === 'vibration' || k === 'sound' ? '1 kHz burst, 10 s window' : '1 reading per second'}<br />Reporting interval: 5 s<br />{sensors.filter((s) => s.param === k).length} sensors assigned</p></Card>
            ))}
          </div>
        )}
        {tab === 'users' && (
          <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead><tr className="text-left text-xs text-muted"><th className="py-2">Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody className="divide-y divide-line">{DEMO_USERS.map((u) => <tr key={u.email}><td className="py-2.5">{u.name}</td><td className="num">{u.email}</td><td>{u.role}</td></tr>)}</tbody></table></div>
        )}
        {tab === 'api' && (
          <div className="max-w-lg space-y-3">
            <Field label="API base URL"><input className="field" placeholder="http://localhost:4000" value={settings.apiUrl} onChange={(e) => save('apiUrl', e.target.value)} /></Field>
            <Field label="API key"><input className="field" type="password" value={settings.apiKey} onChange={(e) => save('apiKey', e.target.value)} /></Field>
            <div className="flex flex-wrap items-center gap-3"><Button onClick={test}>Test connection</Button><span className="text-sm text-muted">Status: {apiMode === 'live' ? 'Connected' : 'Not connected'}</span></div>
            {apiError && <ErrorNote>{apiError}</ErrorNote>}
            <p className="text-xs text-muted">Endpoints: GET /api/machines, /api/machines/:id, /api/sensors, /api/alerts, /api/analytics, /api/maintenance, /api/predictions · POST /api/alerts/:id/acknowledge, /api/maintenance. Reload after changing the URL to fetch from the new backend.</p>
          </div>
        )}
      </Panel>
    </>
  );
}
