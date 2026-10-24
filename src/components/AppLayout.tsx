import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { UtilityBar } from './UtilityBar';
import { LoadingState } from './ui';
import { NAV } from './nav';
import { cn } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useA11y } from '../context/A11yContext';
import { usePlant } from '../context/PlantContext';

const MOBILE = ['/dashboard', '/machines', '/alerts', '/predictive'];

export function AppLayout() {
  const { user, can } = useAuth();
  const { ready } = usePlant();
  const { t } = useA11y();
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { setDrawer(false); window.scrollTo(0, 0); }, [loc.pathname]);
  if (!user) return <Navigate to="/login" replace />;
  const blocked = NAV.find((n) => loc.pathname === n.to && n.perm && !can(n.perm));
  if (blocked) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} drawer={drawer} onCollapse={() => setCollapsed((c) => !c)} onClose={() => setDrawer(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <UtilityBar />
        <Topbar onMenu={() => setDrawer(true)} />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1500px] flex-1 px-3 pb-28 pt-5 sm:px-5 lg:pb-10">
          {ready ? (
            <motion.div key={loc.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          ) : <LoadingState />}
        </main>
      </div>
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden" aria-label="Mobile">
        {NAV.filter((n) => MOBILE.includes(n.to)).map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => cn('flex min-h-[54px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px]', isActive ? 'text-brand' : 'text-muted')}>
            <n.icon size={20} />{t(n.label).split(' ')[0]}
          </NavLink>
        ))}
        <button onClick={() => setDrawer(true)} className="flex min-h-[54px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-muted"><Menu size={20} />More</button>
      </nav>
    </div>
  );
}
