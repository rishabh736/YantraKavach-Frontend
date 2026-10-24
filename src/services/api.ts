import type { Alert, Machine, MaintenanceRecord, Prediction, Sensor } from '../types';
import { buildAlerts, buildMachines, buildMaintenance, buildSensors } from '../lib/mock';
import { DEFAULT_THRESHOLDS } from '../lib/params';
import { predict } from '../lib/engine';

/**
 * Central API service layer.
 * Every call tries the real backend first (Settings → API configuration, or VITE_API_URL).
 * If no backend is configured, or it is unreachable, the mock generators are used as a fallback.
 */
const SETTINGS_KEY = 'yk_settings';

function config() {
  let url = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
  let key = '';
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    if (s.apiUrl) url = s.apiUrl;
    if (s.apiKey) key = s.apiKey;
  } catch { /* ignore */ }
  return { url: url.replace(/\/$/, ''), key };
}

export const apiState: { mode: 'live' | 'demo' } = { mode: 'demo' };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, key } = config();
  if (!url) throw new Error('API not configured');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(url + path, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function get<T>(path: string, fallback: () => T): Promise<T> {
  try {
    const data = await request<T>(path);
    apiState.mode = 'live';
    return data;
  } catch {
    apiState.mode = 'demo';
    return fallback();
  }
}

async function post<T>(path: string, body: unknown, fallback: () => T): Promise<T> {
  try {
    const data = await request<T>(path, { method: 'POST', body: JSON.stringify(body) });
    apiState.mode = 'live';
    return data;
  } catch {
    apiState.mode = 'demo';
    return fallback();
  }
}

export const api = {
  machines: () => get<Machine[]>('/api/machines', buildMachines),
  machine: (id: string, fallback: () => Machine | undefined) => get<Machine | undefined>(`/api/machines/${id}`, fallback),
  sensors: (machines: Machine[]) => get<Sensor[]>('/api/sensors', () => buildSensors(machines)),
  alerts: () => get<Alert[]>('/api/alerts', buildAlerts),
  maintenance: () => get<MaintenanceRecord[]>('/api/maintenance', buildMaintenance),
  predictions: (machines: Machine[]) =>
    get<Prediction[]>('/api/predictions', () => machines.map((m) => predict(m, DEFAULT_THRESHOLDS))),
  analytics: <T,>(range: string, fallback: () => T) => get<T>(`/api/analytics?range=${range}`, fallback),
  acknowledgeAlert: (id: string) => post<{ ok: boolean }>(`/api/alerts/${id}/acknowledge`, {}, () => ({ ok: true })),
  createMaintenance: (rec: Omit<MaintenanceRecord, 'id'>) =>
    post<{ ok: boolean }>('/api/maintenance', rec, () => ({ ok: true })),
  /** Throws if the backend cannot be reached. Used by Settings → Test connection. */
  testConnection: () => request<unknown>('/api/machines'),
};
