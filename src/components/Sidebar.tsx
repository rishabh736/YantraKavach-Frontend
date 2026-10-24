import { NavLink } from 'react-router-dom';
import { Info, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Logo } from './Logo';
import { NAV } from './nav';
import { cn } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { usePlant } from '../context/PlantContext';
import { useA11y } from '../context/A11yContext';

export function Sidebar({ collapsed, drawer, onCollapse, onClose }: { collapsed: boolean; drawer: boolean; onCollapse: () => void; onClose: () => void }) {
  const { can, user } = useAuth();
  const { alerts, apiMode } = usePlant();
  const { t } = useA11y();
  const active = alerts.filter((a) => a.status !== 'resolved').length;
  const items = NAV.filter((n) => !n.perm || can(n.perm));
  const link = (to: string, label: string, Icon: typeof Info, badge?: number) => (
    <NavLink key={to} to={to} onClick={onClose} title={label}
      className={({ isActive }) => cn('group flex items-center gap-3 rounded border-l-[3px] px-3 py-2.5 text-sm font-medium transition',
        isActive ? 'border-brand bg-raised text-ink' : 'border-transparent text-muted hover:bg-raised hover:text-ink', collapsed && 'lg:justify-center lg:px-0')}>
      <Icon size={18} className="shrink-0" />
      <span className={cn('truncate', collapsed && 'lg:hidden')}>{t(label)}</span>
      {badge ? <span className={cn('ml-auto rounded-full bg-crit px-1.5 font-mono text-[11px] font-semibold text-white', collapsed && 'lg:hidden')}>{badge}</span> : null}
    </NavLink>
  );
  return (
    <>
      {drawer && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:transition-[width]',
        drawer ? 'translate-x-0' : '-translate-x-full', collapsed ? 'lg:w-[68px]' : 'lg:w-64')}>
        <div className={cn('flex h-16 items-center border-b border-line px-4', collapsed && 'lg:justify-center lg:px-0')}>
          <Logo compact={collapsed} />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Application">
          {items.map((n) => link(n.to, n.label, n.icon, n.to === '/alerts' ? active : undefined))}
          {link('/about', 'About', Info)}
        </nav>
        <div className="border-t border-line p-3 text-xs text-muted">
          <div className={cn(collapsed && 'lg:hidden')}>
            <div className="truncate font-medium text-ink">{user?.name}</div>
            <div className="truncate">{user?.role}</div>
            <div className="mt-1 flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', apiMode === 'live' ? 'bg-ok' : 'bg-warn')} />{apiMode === 'live' ? 'Connected to plant API' : 'Plant API not connected'}</div>
          </div>
          <button onClick={onCollapse} className="mt-2 hidden h-8 w-full items-center justify-center rounded border border-line hover:bg-raised lg:flex" aria-label="Collapse sidebar">
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
