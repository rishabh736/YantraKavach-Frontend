import type { Alert, Machine, MaintenanceRecord, ParamKey, Range, Readings, Sensor } from '../types';
import { DIAGNOSIS } from './engine';
import { PARAM_KEYS } from './params';
import { pad } from './format';

/* ---------- Demo plant (all fictional) ---------- */
export const NAMES = ['CNC Machine 01','Hydraulic Press 02','Motor Assembly 03','Air Compressor 04','Lathe Machine 05','Conveyor Drive 06','Injection Moulder 07','Milling Machine 08','CNC Machine 09','Hydraulic Press 10','Cooling Pump 11','Grinding Machine 12','Extruder Drive 13','Lathe Machine 14','Packaging Line 15','Motor Assembly 16','Air Compressor 17','Drilling Machine 18','CNC Machine 19','Conveyor Drive 20','Hydraulic Press 21','Cooling Pump 22','Milling Machine 23','Welding Robot 24'];
export const ZONES = ['Zone A · Machining', 'Zone B · Pressing', 'Zone C · Utilities', 'Zone D · Assembly'];
export const TECHNICIANS = ['Ramesh Kumar', 'Anita Sharma', 'Vikram Singh', 'Suresh Negi'];
const [T1, T2, T3, T4] = TECHNICIANS;

const ASSETS: Record<string, { make: string; model: string; kw: number }> = {
  'CNC Machine': { make: 'Arya Machine Tools', model: 'VMC-640', kw: 11 },
  'Hydraulic Press': { make: 'Kaveri Hydraulics', model: 'HP-100T', kw: 15 },
  'Motor Assembly': { make: 'Shivalik Drives', model: 'IM-160L', kw: 11 },
  'Air Compressor': { make: 'Himalaya Pneumatics', model: 'RC-7.5', kw: 7.5 },
  'Lathe Machine': { make: 'Arya Machine Tools', model: 'CL-350', kw: 7.5 },
  'Conveyor Drive': { make: 'Shivalik Drives', model: 'GD-90', kw: 3.7 },
  'Injection Moulder': { make: 'Ganga Plastech', model: 'IM-150', kw: 18.5 },
  'Milling Machine': { make: 'Arya Machine Tools', model: 'MM-4S', kw: 5.5 },
  'Cooling Pump': { make: 'Kaveri Hydraulics', model: 'CP-50', kw: 5.5 },
  'Grinding Machine': { make: 'Arya Machine Tools', model: 'SG-600', kw: 4 },
  'Extruder Drive': { make: 'Ganga Plastech', model: 'EX-75', kw: 22 },
  'Packaging Line': { make: 'Doon Automation', model: 'PL-2', kw: 6 },
  'Drilling Machine': { make: 'Arya Machine Tools', model: 'RD-32', kw: 2.2 },
  'Welding Robot': { make: 'Doon Automation', model: 'WR-6', kw: 9 },
};

export const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const DAY = 864e5;

export function buildMachines(): Machine[] {
  return NAMES.map((name, i) => {
    const r = rng(i * 97 + 13);
    const warn = [1, 3, 8, 12].includes(i);
    const crit = [2, 17].includes(i);
    let t: Readings;
    if (i === 0) t = { temperature: 61, vibration: 2.1, current: 8.4, voltage: 414, sound: 68 };
    else if (i === 1) t = { temperature: 78, vibration: 5.8, current: 12.7, voltage: 404, sound: 82 };
    else if (i === 2) t = { temperature: 91, vibration: 8.7, current: 16.2, voltage: 388, sound: 92 };
    else if (crit) t = { temperature: 88 + r() * 3, vibration: 7.4 + r() * 1.2, current: 15.4 + r(), voltage: 392 + r() * 4, sound: 91 + r() * 2 };
    else if (warn) t = { temperature: 71 + r() * 8, vibration: 4.3 + r() * 1.6, current: 12.1 + r() * 0.9, voltage: 403 + r() * 3, sound: 81 + r() * 3 };
    else t = { temperature: 50 + r() * 15, vibration: 1.4 + r() * 1.6, current: 5 + r() * 6, voltage: 412 + r() * 6, sound: 62 + r() * 10 };
    const ok = !warn && !crit;
    const type = name.replace(/ \d+$/, '');
    const a = ASSETS[type] ?? { make: 'Arya Machine Tools', model: 'GEN-1', kw: 5 };
    const lm = Date.now() - (6 + Math.floor(r() * 70)) * DAY;
    return {
      id: pad(i + 1), name, type, zone: ZONES[Math.floor(i / 6)],
      make: a.make, model: a.model, serial: `${a.model}-${2016 + Math.floor(r() * 8)}-${1000 + Math.floor(r() * 8999)}`,
      ratedKw: a.kw, installed: 2016 + Math.floor(r() * 9),
      readings: { ...t }, target: { ...t },
      baseline: { temperature: 58, vibration: 2.2, current: ok ? t.current : t.current * 0.76, voltage: 415, sound: 68 },
      history: ok ? 94 + Math.round(r() * 5) : warn ? 72 : 46,
      operatingHours: 3200 + Math.floor(r() * 9000),
      uptime: ok ? 97 + r() * 2.5 : warn ? 93 + r() * 3 : 88 + r() * 4,
      lastMaintenance: new Date(lm).toISOString(),
      nextMaintenance: new Date(lm + (ok ? 90 : 45) * DAY).toISOString(),
    };
  });
}

export function buildSensors(machines: Machine[]): Sensor[] {
  const out: Sensor[] = [];
  machines.forEach((m, i) => PARAM_KEYS.forEach((p, k) => {
    const r = rng(i * 31 + k * 7 + 5);
    let battery = Math.round(45 + r() * 55);
    let rssi = -Math.round(44 + r() * 44);
    let state: Sensor['state'] = 'online';
    if ((m.id === '18' && p === 'sound') || (m.id === '21' && p === 'vibration')) { state = 'offline'; battery = 0; rssi = -99; }
    if ((m.id === '06' && p === 'current') || (m.id === '15' && p === 'temperature')) { state = 'low-battery'; battery = 20; }
    const ab = { vibration: 'VIB', temperature: 'TMP', sound: 'SND', current: 'CUR', voltage: 'VLT' }[p];
    out.push({ id: `VK-${ab}-${pad(i + 1, 3)}`, machineId: m.id, param: p, battery, rssi, state });
  }));
  return out;
}

export function buildAlerts(): Alert[] {
  const now = Date.now();
  const A = (id: number, machineId: string, severity: Alert['severity'], param: ParamKey, min: number, status: Alert['status'], technician?: string): Alert =>
    ({ id: `A-${id}`, machineId, severity, param, message: DIAGNOSIS[param].alert, createdAt: now - min * 6e4, status, technician });
  return [
    A(1042, '03', 'critical', 'vibration', 2, 'open'),
    A(1041, '02', 'warning', 'temperature', 18, 'open'),
    A(1040, '18', 'critical', 'current', 34, 'acknowledged', T2),
    A(1039, '04', 'warning', 'vibration', 55, 'open'),
    A(1038, '09', 'high', 'current', 92, 'open'),
    { ...A(1037, '01', 'info', 'temperature', 300, 'open'), message: 'Scheduled lubrication due in 5 days.' },
    A(1036, '13', 'warning', 'sound', 700, 'resolved', T1),
    A(1035, '12', 'high', 'temperature', 1500, 'resolved', T3),
    { ...A(1034, '06', 'info', 'current', 2400, 'resolved', T4), message: 'Sensor VK-CUR-006 battery below 20%.' },
    A(1033, '10', 'warning', 'vibration', 3100, 'resolved', T2),
    A(1032, '16', 'warning', 'temperature', 4300, 'resolved', T1),
    A(1031, '07', 'high', 'vibration', 5900, 'resolved', T3),
    { ...A(1030, '21', 'info', 'vibration', 7300, 'resolved', T4), message: 'Sensor VK-VIB-021 lost connection to gateway.' },
    A(1029, '02', 'warning', 'vibration', 8800, 'resolved', T2),
  ];
}

export function buildMaintenance(): MaintenanceRecord[] {
  const now = Date.now();
  let n = 0;
  const R = (machineId: string, issue: string, action: string, technician: string, dAgo: number, downtimeMin: number, status: MaintenanceRecord['status'], cost: number, parts: string): MaintenanceRecord =>
    ({ id: `WO-${2600 + ++n}`, machineId, issue, action, technician, date: new Date(now - dAgo * DAY).toISOString(), downtimeMin, cost, parts, status });
  return [
    R('03', 'Abnormal vibration', 'Bearing replacement', T4, 0, 0, 'In Progress', 8400, '6310 bearing ×2'),
    R('02', 'Temperature above range', 'Bearing assembly inspection', T2, -3, 0, 'Scheduled', 0, '—'),
    R('04', 'Preventive service', 'Lubrication and filter change', T1, -5, 0, 'Scheduled', 0, 'Oil filter, compressor oil 5 L'),
    R('01', 'Bearing inspection', 'Lubrication performed', T1, 2, 42, 'Completed', 650, 'Grease cartridge'),
    R('12', 'High spindle temperature', 'Coolant line flushed, filter replaced', T3, 4, 95, 'Completed', 3200, 'Coolant filter, coolant 20 L'),
    R('13', 'Acoustic anomaly', 'Gear mesh inspected, fasteners torqued', T1, 6, 60, 'Completed', 900, '—'),
    R('18', 'Current spike on start-up', 'Motor windings tested, contactor replaced', T2, 8, 180, 'Completed', 5600, 'Contactor 32 A'),
    R('02', 'Hydraulic seal seepage', 'Seal kit replacement', T4, 10, 150, 'Completed', 7800, 'Seal kit HP-100'),
    R('06', 'Belt slippage', 'Belt re-tensioned and aligned', T1, 13, 35, 'Completed', 400, 'V-belt B-68'),
    R('09', 'Vibration above baseline', 'Balancing and coupling check', T3, 17, 120, 'Completed', 2900, 'Coupling insert'),
    R('04', 'Vibration trend review', 'Mount bolts checked', T2, 21, 25, 'Completed', 0, '—'),
    R('10', 'Quarterly service', 'Full mechanical inspection', T3, 28, 210, 'Completed', 4100, 'Filters, seals'),
    R('15', 'Sensor battery replacement', 'Batteries replaced on VK-TMP-015', T1, 31, 15, 'Completed', 300, 'Sensor batteries ×2'),
    R('07', 'Hydraulic pressure drift', 'Pump inspection', T4, 36, 90, 'Completed', 6200, 'Relief valve'),
    R('17', 'Unusual compressor noise', 'Valve plate replaced', T2, 41, 140, 'Completed', 5200, 'Valve plate kit'),
    R('11', 'Seal leakage', 'Mechanical seal replaced', T3, 47, 75, 'Completed', 2800, 'Mechanical seal'),
    R('19', 'Spindle runout', 'Spindle bearings re-preloaded', T1, 55, 240, 'Completed', 9800, 'Spindle bearing set'),
    R('24', 'Wire feeder jam', 'Feeder rollers replaced', T4, 63, 55, 'Completed', 1500, 'Feed rollers'),
    R('05', 'Chuck wear', 'Jaws re-ground', T2, 70, 120, 'Completed', 1800, '—'),
    R('20', 'Gearbox oil change', 'Oil replaced, breather cleaned', T3, 78, 45, 'Completed', 1200, 'Gear oil 6 L'),
  ];
}

export const RANGES: Record<Range, { points: number; stepMs: number; time: boolean }> = {
  '1H': { points: 60, stepMs: 6e4, time: true },
  '6H': { points: 72, stepMs: 3e5, time: true },
  '24H': { points: 96, stepMs: 9e5, time: true },
  '7D': { points: 84, stepMs: 72e5, time: false },
  '30D': { points: 90, stepMs: 288e5, time: false },
};

export interface SeriesPoint { t: number; v: number }
export function buildSeries(machineId: string, param: ParamKey, range: Range, current: number, baseline: number, drifting: boolean): SeriesPoint[] {
  const g = RANGES[range];
  const r = rng(hashStr(machineId + param + range));
  const start = drifting ? baseline : current * 0.98;
  const amp = param === 'voltage' ? 2 : Math.abs(current) * 0.035;
  const now = Date.now();
  const out: SeriesPoint[] = [];
  for (let i = 0; i < g.points; i++) {
    const k = i / (g.points - 1);
    out.push({ t: now - (g.points - 1 - i) * g.stepMs, v: Math.max(0.1, start + (current - start) * Math.pow(k, drifting ? 2.2 : 1) + (r() - 0.5) * 2 * amp) });
  }
  out[out.length - 1].v = current;
  return out;
}

export type AnalyticsRange = '7D' | '30D' | '90D';
export interface AnalyticsData {
  labels: string[];
  uptime: number[]; downtime: number[]; failures: number[]; energy: number[]; maintenance: number[];
  temp: { cnc: number[]; press: number[]; motor: number[] };
  vib: { cnc: number[]; press: number[]; compressor: number[] };
  kpi: { oee: number; mtbfHours: number; mttrHours: number; energyCost: number; costAvoided: number; planned: number };
}
export function buildAnalytics(range: AnalyticsRange): AnalyticsData {
  const n = range === '7D' ? 7 : range === '30D' ? 10 : 12;
  const stepDays = range === '7D' ? 1 : range === '30D' ? 3 : 7;
  const mul = range === '7D' ? 1 : range === '30D' ? 3 : 7;
  const r = rng(hashStr('an' + range));
  const labels = Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * stepDays * DAY);
    return range === '7D' ? d.toLocaleString('en', { weekday: 'short' }) : `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`;
  });
  const ser = (a: number, b: number) => labels.map(() => a + r() * (b - a));
  const trend = (a: number, b: number) => labels.map((_, i) => a + ((b - a) * i) / (n - 1) + (r() - 0.5) * (b - a) * 0.3);
  const energy = ser(900, 1300).map((x) => (x * mul) / 2);
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 90;
  return {
    labels,
    uptime: ser(94, 98.5),
    downtime: ser(1, 5).map((x) => (x * mul) / 2),
    failures: labels.map(() => Math.round(r() * 2 * (mul > 1 ? 1.5 : 1))),
    energy,
    maintenance: labels.map(() => Math.round((3 + r() * 6) * (mul > 1 ? mul / 2 : 1))),
    temp: { cnc: trend(56, 62), press: trend(70, 79), motor: trend(80, 91) },
    vib: { cnc: trend(2, 2.2), press: trend(4, 5.8), compressor: trend(2.6, 4.8) },
    kpi: {
      oee: 80 + r() * 5, mtbfHours: 380 + r() * 60, mttrHours: 1.5 + r() * 0.8,
      energyCost: Math.round(energy.reduce((a, b) => a + b, 0) * 7.6),
      costAvoided: Math.round(days * (9000 + r() * 4000)),
      planned: 88 + Math.round(r() * 6),
    },
  };
}
