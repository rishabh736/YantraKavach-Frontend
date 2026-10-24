import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { PublicLayout } from './pages/PublicLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingState } from './components/ui';

const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const AccessibilityStatement = lazy(() => import('./pages/AccessibilityStatement'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Machines = lazy(() => import('./pages/Machines'));
const MachineDetail = lazy(() => import('./pages/MachineDetail'));
const Predictive = lazy(() => import('./pages/Predictive'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Sensors = lazy(() => import('./pages/Sensors'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense fallback={<div className="mx-auto max-w-5xl p-6"><LoadingState /></div>}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/accessibility" element={<AccessibilityStatement />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/machines" element={<Machines />} />
              <Route path="/machines/:id" element={<MachineDetail />} />
              <Route path="/predictive" element={<Predictive />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/sensors" element={<Sensors />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  );
}
