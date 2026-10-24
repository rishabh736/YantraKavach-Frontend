import { Activity, Thermometer, Volume2, Zap, Plug } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ParamKey, Thresholds } from '../types';

export const PARAM_KEYS: ParamKey[] = ['vibration', 'temperature', 'sound', 'current', 'voltage'];

export interface ParamMeta {
  label: string;
  short: string;
  unit: string;
  decimals: number;
  color: string;
  noise: number;
  icon: LucideIcon;
  blurb: string;
}

export const PARAMS: Record<ParamKey, ParamMeta> = {
  vibration: { label: 'Vibration', short: 'Vib', unit: 'mm/s', decimals: 1, color: '#0891b2', noise: 0.1, icon: Activity, blurb: 'Detect abnormal mechanical vibrations and imbalance.' },
  temperature: { label: 'Temperature', short: 'Temp', unit: '°C', decimals: 0, color: '#ea580c', noise: 0.45, icon: Thermometer, blurb: 'Identify overheating and thermal anomalies.' },
  sound: { label: 'Sound', short: 'Snd', unit: 'dB', decimals: 0, color: '#7c3aed', noise: 0.7, icon: Volume2, blurb: 'Detect unusual acoustic patterns associated with machine faults.' },
  current: { label: 'Current', short: 'Cur', unit: 'A', decimals: 1, color: '#d97706', noise: 0.1, icon: Zap, blurb: 'Monitor electrical load and abnormal consumption.' },
  voltage: { label: 'Voltage', short: 'Volt', unit: 'V', decimals: 0, color: '#16a34a', noise: 1, icon: Plug, blurb: 'Identify electrical irregularities.' },
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  vibration: { warn: 4, crit: 7 },
  temperature: { warn: 70, crit: 85 },
  sound: { warn: 80, crit: 90 },
  current: { warn: 12, crit: 15 },
  voltage: { warn: 5, crit: 10 }, // % deviation from 415 V nominal
};

export const fmtValue = (k: ParamKey, v: number) => v.toFixed(PARAMS[k].decimals);
