import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui';
import { UtilityBar } from '../components/UtilityBar';
import { useAuth } from '../context/AuthContext';
import { useA11y } from '../context/A11yContext';
import { SITE } from '../config/site';

export function PublicLayout() {
  const { user } = useAuth();
  const { t } = useA11y();
  const nav = useNavigate();
  const loc = useLocation();

  const go = (id: string) => {
    if (loc.pathname === '/') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    else nav('/', { state: { scrollTo: id } });
  };
  useEffect(() => { if (!(loc.state as { scrollTo?: string } | null)?.scrollTo) window.scrollTo(0, 0); }, [loc.pathname, loc.state]);

  const linkCls = 'rounded px-3 py-2 text-sm font-medium text-muted hover:text-ink';
  const links = (
    <>
      <button className={linkCls} onClick={() => go('technology')}>{t('Technology')}</button>
      <button className={linkCls} onClick={() => go('trust')}>{t('Trust')}</button>
      <NavLink to="/about" className={linkCls}>{t('About')}</NavLink>
      <NavLink to="/contact" className={linkCls}>{t('Contact')}</NavLink>
    </>
  );

  return (
    <div className="min-h-screen bg-surface">
      <UtilityBar />
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur no-print">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="Yantra Kavach home"><Logo sub={false} /></Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">{links}</nav>
          <Link to={user ? '/dashboard' : '/login'}><Button variant="primary" size="sm">{user ? t('Open dashboard') : t('Log in')}</Button></Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 md:hidden" aria-label="Main (mobile)">{links}</nav>
      </header>
      <main id="main" tabIndex={-1}><Outlet /></main>
      <footer className="border-t border-line bg-bg text-sm no-print">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo sub={false} />
            <p className="mt-3 max-w-xs text-muted">{t(SITE.tagline)}</p>
            <p className="mt-3 max-w-xs text-xs text-muted">AI-Powered Predictive Maintenance for MSMEs.</p>
          </div>
          <div>
            <h2 className="mb-2 font-display text-base font-semibold">{t('Product')}</h2>
            <ul className="space-y-1.5 text-muted">
              <li><button onClick={() => go('technology')} className="hover:text-ink">{t('Technology')}</button></li>
              <li><Link to={user ? '/dashboard' : '/login'} className="hover:text-ink">{t('View Live Dashboard')}</Link></li>
              <li><Link to="/about" className="hover:text-ink">{t('About')}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-2 font-display text-base font-semibold">{t('Legal')}</h2>
            <ul className="space-y-1.5 text-muted">
              <li><Link to="/privacy" className="hover:text-ink">{t('Privacy Policy')}</Link></li>
              <li><Link to="/terms" className="hover:text-ink">{t('Terms of Use')}</Link></li>
              <li><Link to="/accessibility" className="hover:text-ink">{t('Accessibility')}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-2 font-display text-base font-semibold">{t('Contact')}</h2>
            <address className="space-y-1.5 not-italic text-muted">
              <div>{SITE.email}</div><div>{SITE.phone}</div><div>{SITE.address}</div><div>{SITE.hours}</div>
            </address>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted sm:px-6">
            <span>© 2026 {SITE.name}. All rights reserved. Last updated {SITE.lastUpdated}.</span>
            <span>{SITE.name} is an independent product and is not affiliated with, or endorsed by, any government body.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
