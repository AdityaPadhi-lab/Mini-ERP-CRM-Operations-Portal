import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; loading?: boolean; children: ReactNode };
export function Button({ variant = 'primary', size = 'md', loading, className, disabled, children, ...props }: Props) {
  const variants = {
    primary: 'bg-slate-950 text-white hover:bg-indigo-950 shadow-sm shadow-slate-950/10',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/10',
  };
  return <button {...props} disabled={disabled || loading} className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60', size === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 px-4 text-sm', variants[variant], className)}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{children}</button>;
}
