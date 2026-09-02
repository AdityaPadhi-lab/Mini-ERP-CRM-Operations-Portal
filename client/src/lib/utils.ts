import { clsx, type ClassValue } from 'clsx';
export const cn = (...values: ClassValue[]) => clsx(values);
export const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
export const currency = (value: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value));
export const date = (value?: string | null, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) => value ? new Intl.DateTimeFormat('en-IN', options).format(new Date(value)) : '—';
export const dateTime = (value?: string | null) => date(value, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
