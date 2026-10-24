export type ParamKey = 'vibration' | 'temperature' | 'sound' | 'current' | 'voltage';
export type Status = 'healthy' | 'warning' | 'critical';
export type Severity = 'info' | 'warning' | 'high' | 'critical';
export type Role = 'Admin' | 'Maintenance Manager' | 'Operator';
export type Range = '1H' | '6H' | '24H' | '7D' | '30D';

export type Readings = Record<ParamKey, number>;
export type Thresholds = Record<ParamKey, { warn: number; crit: number }>;

export interface Machine {
  id: string;
  name: string;
  type: string;
  zone: string;
  make: string;
  model: string;
  serial: string;
  ratedKw: number;
  installed: number;
  readings: Readings;
  target: Readings;
  baseline: Readings;
  history: number;
  operatingHours: number;
  uptime: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface Alert {
  id: string;
  machineId: string;
  severity: Severity;
  param: ParamKey;
  message: string;
  createdAt: number;
  status: 'open' | 'acknowledged' | 'resolved';
  technician?: string;
}

export interface Sensor {
  id: string;
  machineId: string;
  param: ParamKey;
  battery: number;
  rssi: number;
  state: 'online' | 'low-battery' | 'offline';
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  issue: string;
  action: string;
  technician: string;
  date: string;
  downtimeMin: number;
  cost: number;
  parts: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
}

export interface Settings {
  plantName: string;
  apiUrl: string;
  apiKey: string;
  notifyPush: boolean;
  notifyEmail: boolean;
  notifySms: boolean;
  digest: boolean;
  minSeverity: Severity;
}

export interface User {
  name: string;
  email: string;
  role: Role;
}

export interface Prediction {
  machine: Machine;
  status: Status;
  health: number;
  worst: ParamKey;
  abnormal: ParamKey[];
  risk: 'Low' | 'Medium' | 'High';
  window: string;
  pattern: string;
  what: string;
  where: string;
  why: string;
  impact: string;
  action: string;
  confidence: number;
  stage: number;
}
