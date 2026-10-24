import { BarChart3, BrainCircuit, Bell, Cpu, FileText, LayoutDashboard, Radio, Settings, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Permission } from '../context/AuthContext';

export interface NavItem { to: string; label: string; icon: LucideIcon; perm?: Permission }
export const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/machines', label: 'Machines', icon: Cpu },
  { to: '/sensors', label: 'Sensors', icon: Radio },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/predictive', label: 'Predictive Maintenance', icon: BrainCircuit },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: FileText, perm: 'reports' },
  { to: '/settings', label: 'Settings', icon: Settings, perm: 'settings' },
];
