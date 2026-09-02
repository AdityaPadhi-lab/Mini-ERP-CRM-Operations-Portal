import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role, User } from '../types';
import { authService } from '../services/auth.service';

type AuthContextValue = { user: User | null; isAuthenticated: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; can: (...roles: Role[]) => boolean };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => { try { return JSON.parse(localStorage.getItem('opsflow_user') ?? 'null'); } catch { return null; } });
  const logout = () => { localStorage.removeItem('opsflow_token'); localStorage.removeItem('opsflow_user'); setUser(null); };
  useEffect(() => { window.addEventListener('opsflow:unauthorized', logout); return () => window.removeEventListener('opsflow:unauthorized', logout); });
  const value = useMemo<AuthContextValue>(() => ({ user, isAuthenticated: Boolean(user && localStorage.getItem('opsflow_token')), login: async (email, password) => { const response = await authService.login(email, password); localStorage.setItem('opsflow_token', response.token); localStorage.setItem('opsflow_user', JSON.stringify(response.user)); setUser(response.user); }, logout, can: (...roles) => Boolean(user && roles.includes(user.role)) }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context; }
