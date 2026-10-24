import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Moon, Search, Sun, User as UserIcon } from 'lucide-react';
import { LiveBadge, SeverityBadge, StatusBadge } from './ui';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ago } from '../lib/format';

function useAway(ref: RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  });
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { machines, alerts, statusOf, getMachine } = usePlant();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<'' | 'notif' | 'user' | 'search'>('');
  const box = useRef<HTMLDivElement>(null);
  useAway(box, () => setOpen(''));
  const active = alerts.filter((a) => a.status !== 'resolved');
  const crit = active.filter((a) => a.severity === 'critical' || a.severity === 'high').length;
  const results = q ? machines.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];

  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center gap-2 border-b border-line bg-surface/95 px-3 pt-[env(safe-area-inset-top)] backdrop-blur sm:px-5">
      <button onClick={onMenu} className="rounded p-2 text-muted hover:bg-raised hover:text-ink lg:hidden" aria-label="Open menu"><Menu size={20} /></button>
      <div ref={box} className="relative flex flex-1 items-center gap-2">
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search size={16} className="absolute left-3 top-3 text-muted" />
          <input className="field pl-9" placeholder="Search machines…" value={q} aria-label="Search machines"
            onChange={(e) => { setQ(e.target.value); setOpen('search'); }} onFocus={() => setOpen('search')} />
          {open === 'search' && q && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded border border-line bg-surface shadow-xl">
              {results.length ? results.map((m) => (
                <button key={m.id} className="flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2.5 text-left text-sm last:border-0 hover:bg-raised"
                  onClick={() => { setQ(''); setOpen(''); nav(`/machines/${m.id}`); }}>
                  <span>{m.name}</span><StatusBadge status={statusOf(m)} />
                </button>
              )) : <div className="px-3 py-4 text-sm text-muted">No machine found</div>}
            </div>
          )}
        </div>
        <span className="flex-1" />
        <span className="hidden sm:block"><LiveBadge /></span>
        <button onClick={toggle} className="rounded p-2 text-muted hover:bg-raised hover:text-ink" aria-label="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>

        <div className="relative">
          <button onClick={() => setOpen(open === 'notif' ? '' : 'notif')} className="relative rounded p-2 text-muted hover:bg-raised hover:text-ink" aria-label="Notifications">
            <Bell size={18} />
            {crit > 0 && <span className="absolute right-0.5 top-0.5 rounded-full bg-crit px-1 font-mono text-[10px] font-semibold leading-4 text-white">{crit}</span>}
          </button>
          {open === 'notif' && (
            <div className="absolute right-0 top-11 z-50 w-[min(360px,92vw)] rounded border border-line bg-surface shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-3 py-2.5 text-sm"><b>Notifications</b><Link to="/alerts" onClick={() => setOpen('')} className="text-info hover:underline">View all</Link></div>
              {active.slice(0, 6).map((a) => (
                <Link key={a.id} to="/alerts" onClick={() => setOpen('')} className="flex items-start justify-between gap-3 border-b border-line px-3 py-2.5 last:border-0 hover:bg-raised">
                  <span className="min-w-0"><span className="block truncate text-sm font-medium">{getMachine(a.machineId)?.name}</span><span className="block truncate text-xs text-muted">{a.message} · {ago(a.createdAt)}</span></span>
                  <SeverityBadge severity={a.severity} />
                </Link>
              ))}
              {!active.length && <div className="px-3 py-6 text-center text-sm text-muted">No active alerts</div>}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setOpen(open === 'user' ? '' : 'user')} className="rounded p-2 text-muted hover:bg-raised hover:text-ink" aria-label="User menu"><UserIcon size={18} /></button>
          {open === 'user' && (
            <div className="absolute right-0 top-11 z-50 w-56 rounded border border-line bg-surface p-3 shadow-xl">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="mb-3 truncate text-xs text-muted">{user?.email} · {user?.role}</div>
              <button onClick={() => { logout(); nav('/'); }} className="flex h-9 w-full items-center justify-center gap-2 rounded border border-line text-sm hover:bg-raised"><LogOut size={15} />Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
