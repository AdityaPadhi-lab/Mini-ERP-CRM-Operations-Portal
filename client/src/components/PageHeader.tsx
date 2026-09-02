import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600">{eyebrow}</p>}
      <h1 className="text-[1.7rem] font-extrabold tracking-[-.035em] text-slate-950 sm:text-3xl">{title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>;
}
