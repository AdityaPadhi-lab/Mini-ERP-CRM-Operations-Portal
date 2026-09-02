import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) {
  const tones = { neutral: 'bg-slate-100 text-slate-600 ring-slate-200', success: 'bg-emerald-50 text-emerald-700 ring-emerald-100', warning: 'bg-amber-50 text-amber-700 ring-amber-100', danger: 'bg-red-50 text-red-700 ring-red-100', info: 'bg-blue-50 text-blue-700 ring-blue-100' };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset', tones[tone])}>{children}</span>;
}
