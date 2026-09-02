import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

type Toast = { id: number; message: string; type: 'success' | 'error' };
const ToastContext = createContext<{ success: (message: string) => void; error: (message: string) => void } | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string, type: Toast['type']) => { const id = Date.now(); setToasts((current) => [...current, { id, message, type }]); window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500); }, []);
  return <ToastContext.Provider value={{ success: (message) => add(message, 'success'), error: (message) => add(message, 'error') }}>{children}<div className="fixed bottom-5 right-5 z-[60] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-3" aria-live="polite">{toasts.map((toast) => <div key={toast.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg"><div className={toast.type === 'success' ? 'text-emerald-600' : 'text-red-600'}>{toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}</div><p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p><button onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div>)}</div></ToastContext.Provider>;
}
export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error('useToast must be used inside ToastProvider'); return context; }
