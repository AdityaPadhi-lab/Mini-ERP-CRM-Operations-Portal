import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

export function Dialog({ open, title, description, onClose, children, footer }: { open: boolean; title: string; description?: string; onClose: () => void; children?: ReactNode; footer?: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-4 sm:items-center sm:justify-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><h2 id="dialog-title" className="text-lg font-semibold text-ink">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}</div><button ref={closeRef} onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close dialog"><X className="h-5 w-5" /></button></div>
      {children && <div className="px-6 py-5">{children}</div>}
      {footer && <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">{footer}</div>}
    </div>
  </div>;
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', tone = 'primary', loading, onCancel, onConfirm }: { open: boolean; title: string; description: string; confirmLabel?: string; tone?: 'primary' | 'danger'; loading?: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Dialog open={open} title={title} description={description} onClose={onCancel} footer={<><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button></>} />;
}
