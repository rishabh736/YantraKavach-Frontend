import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, User } from '../types';

export const DEMO_USERS: { email: string; role: Role; name: string }[] = [
  { email: 'admin@yantrakavach.in', role: 'Admin', name: 'Plant Admin' },
  { email: 'manager@yantrakavach.in', role: 'Maintenance Manager', name: 'Maintenance Lead' },
  { email: 'operator@yantrakavach.in', role: 'Operator', name: 'Shift Operator' },
];
export const DEMO_PASSWORD = 'demo123';
export type Permission = 'settings' | 'reports' | 'maintenance-write' | 'users' | 'api';

interface Ctx {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => string | null;
  signup: (name: string, email: string, password: string, role: Role) => string | null;
  logout: () => void;
  can: (p: Permission) => boolean;
}
const AuthCtx = createContext<Ctx>({ user: null, login: () => null, signup: () => null, logout: () => {}, can: () => false });
export const useAuth = () => useContext(AuthCtx);

const KEY = 'yk_user';
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
  });
  const persist = (u: User, remember: boolean) => {
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(u));
    setUser(u);
  };
  const login: Ctx['login'] = (email, password, remember) => {
    const found = DEMO_USERS.find((u) => u.email === email.trim().toLowerCase());
    if (!email.trim() || !password) return 'Enter your email and password.';
    if (!found || password !== DEMO_PASSWORD) return 'Email or password does not match. Use one of the accounts shown on this screen.';
    persist(found, remember);
    return null;
  };
  const signup: Ctx['signup'] = (name, email, password, role) => {
    if (!name.trim() || !email.trim()) return 'Enter your name and email.';
    if (password.length < 6) return 'Use a password with at least 6 characters.';
    persist({ name, email: email.trim().toLowerCase(), role }, true);
    return null;
  };
  const logout = () => { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); setUser(null); };
  const can = (p: Permission) => {
    const r = user?.role;
    if (!r) return false;
    if (p === 'users' || p === 'api') return r === 'Admin';
    return r !== 'Operator';
  };
  return <AuthCtx.Provider value={{ user, login, signup, logout, can }}>{children}</AuthCtx.Provider>;
}
