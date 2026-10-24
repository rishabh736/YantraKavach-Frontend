import type { Machine, ParamKey, Prediction, Readings, Status, Thresholds } from '../types';
import { PARAMS, PARAM_KEYS } from './params';

export const NOMINAL_VOLTAGE = 415;
const RANK: Record<Status, number> = { healthy: 0, warning: 1, critical: 2 };

/** Voltage is judged as % deviation from nominal; everything else as its raw value. */
export const deviation = (k: ParamKey, v: number) =>
  k === 'voltage' ? (Math.abs(v - NOMINAL_VOLTAGE) / NOMINAL_VOLTAGE) * 100 : v;

export function paramStatus(k: ParamKey, v: number, th: Thresholds): Status {
  const x = deviation(k, v);
  const t = th[k];
  return x > t.crit ? 'critical' : x >= t.warn ? 'warning' : 'healthy';
}

export function machineStatus(r: Readings, th: Thresholds): Status {
  let s: Status = 'healthy';
  for (const k of PARAM_KEYS) {
    const p = paramStatus(k, r[k], th);
    if (RANK[p] > RANK[s]) s = p;
  }
  return s;
}

export function factorScore(k: ParamKey, v: number, th: Thresholds): number {
  const x = deviation(k, v);
  const { warn: w, crit: c } = th[k];
  const ok = w * 0.8;
  if (x <= ok) return 100;
  if (x <= w) return 100 - ((x - ok) / (w - ok)) * 30;
  if (x <= c) return 70 - ((x - w) / (c - w)) * 40;
  return Math.max(5, 30 - ((x - c) / c) * 60);
}

export const WEIGHTS = { vibration: 0.3, temperature: 0.25, current: 0.15, voltage: 0.1, sound: 0.1, history: 0.1 } as const;
export type FactorKey = keyof typeof WEIGHTS;
export const FACTOR_LABEL: Record<FactorKey, string> = {
  vibration: 'Vibration', temperature: 'Temperature', current: 'Current', voltage: 'Voltage', sound: 'Sound', history: 'Historical behaviour',
};

export function factorScores(m: Machine, th: Thresholds): Record<FactorKey, number> {
  return {
    vibration: factorScore('vibration', m.readings.vibration, th),
    temperature: factorScore('temperature', m.readings.temperature, th),
    current: factorScore('current', m.readings.current, th),
    voltage: factorScore('voltage', m.readings.voltage, th),
    sound: factorScore('sound', m.readings.sound, th),
    history: m.history,
  };
}

export function healthScore(m: Machine, th: Thresholds): number {
  const f = factorScores(m, th);
  return Math.round((Object.keys(WEIGHTS) as FactorKey[]).reduce((a, k) => a + f[k] * WEIGHTS[k], 0));
}

const ratio = (m: Machine, k: ParamKey, th: Thresholds) => deviation(k, m.readings[k]) / th[k].warn;
export function worstParam(m: Machine, th: Thresholds): ParamKey {
  return PARAM_KEYS.reduce((a, k) => (ratio(m, k, th) > ratio(m, a, th) ? k : a), 'vibration' as ParamKey);
}

export const DIAGNOSIS: Record<ParamKey, { what: string; where: string; impact: string; action: string; alert: string }> = {
  vibration: { what: 'Abnormal vibration detected.', where: 'Drive-end bearing region.', impact: 'Potential bearing degradation.', action: 'Inspect bearing lubrication and alignment.', alert: 'Abnormal vibration detected.' },
  temperature: { what: 'Sustained overheating detected.', where: 'Motor housing and gearbox surface.', impact: 'Insulation ageing and lubricant breakdown.', action: 'Check cooling airflow, lubricant level and load.', alert: 'Temperature exceeding normal operating range.' },
  current: { what: 'Motor current above rated load.', where: 'Main drive motor winding.', impact: 'Winding stress and possible mechanical binding.', action: 'Inspect belt tension, coupling and load condition.', alert: 'Motor current exceeding rated limit.' },
  voltage: { what: 'Supply voltage outside tolerance.', where: 'Incoming three-phase supply.', impact: 'Motor overheating and controller faults.', action: 'Check phase balance and terminal connections.', alert: 'Supply voltage outside tolerance.' },
  sound: { what: 'Acoustic level above baseline.', where: 'Gearbox and spindle assembly.', impact: 'Gear wear or loose components.', action: 'Inspect gears and fasteners for wear.', alert: 'Acoustic level above baseline.' },
};

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

export function predict(m: Machine, th: Thresholds): Prediction {
  const status = machineStatus(m.readings, th);
  const health = healthScore(m, th);
  const worst = worstParam(m, th);
  const d = DIAGNOSIS[worst];
  const abnormal = PARAM_KEYS.filter((k) => paramStatus(k, m.readings[k], th) !== 'healthy');
  const pct = worst === 'voltage'
    ? Math.round(deviation('voltage', m.readings.voltage))
    : Math.round((m.readings[worst] / m.baseline[worst] - 1) * 100);
  const corr = abnormal.includes('vibration') && abnormal.includes('temperature');
  return {
    machine: m, status, health, worst, abnormal,
    risk: status === 'critical' ? 'High' : status === 'warning' ? 'Medium' : 'Low',
    window: status === 'critical' ? '1–3 days' : status === 'warning' ? '7–14 days' : 'More than 60 days',
    pattern: status === 'healthy' ? 'No abnormal pattern' : corr ? 'Increasing vibration + temperature correlation' : `${PARAMS[worst].label} drifting above baseline`,
    what: d.what,
    where: d.where,
    why: worst === 'voltage'
      ? `Supply voltage deviates ${pct}% from the ${NOMINAL_VOLTAGE} V nominal.`
      : `${PARAMS[worst].label} amplitude has increased by ${pct}% over the baseline.`,
    impact: d.impact,
    action: d.action,
    confidence: Math.min(96, 70 + Math.round((100 - health) / 3) + (hash(m.id) % 6)),
    stage: status === 'critical' ? 4 : status === 'warning' ? (health < 70 ? 3 : 2) : 0,
  };
}
