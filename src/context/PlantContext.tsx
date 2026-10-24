import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Alert, Machine, MaintenanceRecord, Sensor, Settings, Severity, Status, Thresholds } from '../types';
import { api, apiState } from '../services/api';
import { DEFAULT_THRESHOLDS, PARAMS, PARAM_KEYS } from '../lib/params';
import { DIAGNOSIS, healthScore, machineStatus, worstParam } from '../lib/engine';
import { useToast } from './ToastContext';

const DEFAULT_SETTINGS: Settings = {
  plantName: 'Bhagirathi Precision Works — Plant 1',
  apiUrl: '', apiKey: '',
  notifyPush: true, notifyEmail: true, notifySms: false, digest: true,
  minSeverity: 'warning',
};
const SEV_RANK: Record<Severity, number> = { info: 0, warning: 1, high: 2, critical: 3 };

interface PlantCtx {
  ready: boolean;
  apiMode: 'live' | 'demo';
  machines: Machine[];
  sensors: Sensor[];
  alerts: Alert[];
  maintenance: MaintenanceRecord[];
  thresholds: Thresholds;
  settings: Settings;
  statusOf: (m: Machine) => Status;
  healthOf: (m: Machine) => number;
  getMachine: (id: string) => Machine | undefined;
  setThresholds: (t: Thresholds) => void;
  setSettings: (s: Settings) => void;
  acknowledge: (id: string) => Promise<void>;
  resolve: (id: string) => void;
  assign: (id: string, tech: string) => void;
  addMaintenance: (r: Omit<MaintenanceRecord, 'id'>) => Promise<void>;
  injectFault: () => void;
  resetSim: () => void;
}

const Ctx = createContext<PlantCtx | null>(null);
export const usePlant = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePlant must be used inside PlantProvider');
  return c;
};

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? ({ ...fallback, ...JSON.parse(v) } as T) : fallback; } catch { return fallback; }
}

export function PlantProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [thresholds, setThresholdsState] = useState<Thresholds>(() => load('yk_thresholds', DEFAULT_THRESHOLDS));
  const [settings, setSettingsState] = useState<Settings>(() => load('yk_settings', DEFAULT_SETTINGS));
  const [apiMode, setApiMode] = useState<'live' | 'demo'>('demo');

  const mRef = useRef<Machine[]>([]);
  const thRef = useRef(thresholds);
  const setRef = useRef(settings);
  const statusRef = useRef<Record<string, Status>>({});
  const idRef = useRef(1042);
  mRef.current = machines;
  thRef.current = thresholds;
  setRef.current = settings;

  useEffect(() => {
    let alive = true;
    (async () => {
      const ms = await api.machines();
      const [ss, as, mt] = await Promise.all([api.sensors(ms), api.alerts(), api.maintenance()]);
      if (!alive) return;
      ms.forEach((m) => { statusRef.current[m.id] = machineStatus(m.readings, thRef.current); });
      setMachines(ms); setSensors(ss); setAlerts(as); setMaintenance(mt);
      setApiMode(apiState.mode);
      setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  // Simulated telemetry stream (replace with WebSocket / polling once a backend exists)
  useEffect(() => {
    const timer = setInterval(() => {
      const prev = mRef.current;
      if (!prev.length) return;
      const th = thRef.current;
      const raised: Alert[] = [];
      const next = prev.map((m) => {
        const readings = { ...m.readings };
        for (const k of PARAM_KEYS) {
          readings[k] = Math.max(0.1, readings[k] + (m.target[k] - readings[k]) * 0.25 + (Math.random() - 0.5) * PARAMS[k].noise);
        }
        const updated = { ...m, readings };
        const st = machineStatus(readings, th);
        const before = statusRef.current[m.id] ?? 'healthy';
        const rank = { healthy: 0, warning: 1, critical: 2 };
        if (rank[st] > rank[before]) {
          const w = worstParam(updated, th);
          raised.push({
            id: `A-${++idRef.current}`, machineId: m.id, param: w, message: DIAGNOSIS[w].alert, createdAt: Date.now(), status: 'open',
            severity: st === 'critical' ? 'critical' : healthScore(updated, th) < 60 ? 'high' : 'warning',
          });
        }
        statusRef.current[m.id] = st;
        return updated;
      });
      setMachines(next);
      if (raised.length) {
        setAlerts((a) => [...raised, ...a]);
        const s = setRef.current;
        raised.forEach((r) => {
          if (s.notifyPush && SEV_RANK[r.severity] >= SEV_RANK[s.minSeverity]) {
            const name = next.find((m) => m.id === r.machineId)?.name ?? r.machineId;
            toast(`${name}: ${r.message}`, r.severity === 'critical' ? 'crit' : 'warn');
          }
        });
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [toast]);

  const statusOf = useCallback((m: Machine) => machineStatus(m.readings, thresholds), [thresholds]);
  const healthOf = useCallback((m: Machine) => healthScore(m, thresholds), [thresholds]);
  const getMachine = useCallback((id: string) => machines.find((m) => m.id === id), [machines]);

  const value = useMemo<PlantCtx>(() => ({
    ready, apiMode, machines, sensors, alerts, maintenance, thresholds, settings, statusOf, healthOf, getMachine,
    setThresholds: (t) => { setThresholdsState(t); localStorage.setItem('yk_thresholds', JSON.stringify(t)); },
    setSettings: (s) => { setSettingsState(s); localStorage.setItem('yk_settings', JSON.stringify(s)); },
    acknowledge: async (id) => {
      setAlerts((a) => a.map((x) => (x.id === id ? { ...x, status: 'acknowledged' } : x)));
      await api.acknowledgeAlert(id);
      setApiMode(apiState.mode);
    },
    resolve: (id) => setAlerts((a) => a.map((x) => (x.id === id ? { ...x, status: 'resolved' } : x))),
    assign: (id, tech) => setAlerts((a) => a.map((x) => (x.id === id ? { ...x, technician: tech, status: x.status === 'open' ? 'acknowledged' : x.status } : x))),
    addMaintenance: async (r) => {
      const rec: MaintenanceRecord = { ...r, id: `W-${Math.round(Math.random() * 1e5)}` };
      setMaintenance((m) => [rec, ...m]);
      await api.createMaintenance(r);
      setApiMode(apiState.mode);
    },
    injectFault: () => setMachines((ms) => ms.map((m) => (m.id === '04' ? { ...m, target: { ...m.target, vibration: 8.3, temperature: 87, sound: 91 } } : m))),
    resetSim: () => setMachines((ms) => ms.map((m) => {
      const orig = m; // targets are restored from the stored baseline profile below
      return { ...orig, target: { ...orig.target, ...(m.id === '04' ? RESET_04 : {}) } };
    })),
  }), [ready, apiMode, machines, sensors, alerts, maintenance, thresholds, settings, statusOf, healthOf, getMachine]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Air Compressor 04 demo profile (warning state) used when resetting the simulation
const RESET_04 = { vibration: 5.1, temperature: 74, sound: 82 };
