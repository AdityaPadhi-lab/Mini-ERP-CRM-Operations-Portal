import { useState, type ComponentType } from 'react';
import { Bell, Boxes, ClipboardList, LayoutDashboard, LogOut, Menu, PackageSearch, PanelLeftClose, PanelLeftOpen, Users, Warehouse, X } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';
import { cn, initials } from '../lib/utils';

type NavItem = { label: string; to: string; icon: ComponentType<{ className?: string }>; roles: Role[] };
const navigation: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { label: 'Customers', to: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { label: 'Products', to: '/products', icon: PackageSearch, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { label: 'Inventory', to: '/inventory', icon: Warehouse, roles: ['ADMIN', 'WAREHOUSE'] },
  { label: 'Sales Challans', to: '/challans', icon: ClipboardList, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
];
const pageNames: Record<string, string> = { '/dashboard': 'Overview', '/customers': 'Customers', '/products': 'Products', '/inventory': 'Inventory', '/challans': 'Sales Challans' };

export function AppShell() {
  const { user, can, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentName = Object.entries(pageNames).find(([path]) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(`${path}/`)))?.[1] ?? 'OpsFlow';
  const signOut = () => { logout(); navigate('/login'); };
  const nav = <nav className="space-y-1.5 px-3 py-5" aria-label="Primary navigation">
    <p className={cn('px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400', collapsed && 'hidden')}>Workspace</p>
    {navigation.filter((item) => can(...item.roles)).map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => cn('group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all', isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900', collapsed && 'justify-center px-2')} title={collapsed ? item.label : undefined}><Icon className={cn('h-[18px] w-[18px] shrink-0', 'transition-transform group-hover:scale-105')} /><span className={cn(collapsed && 'hidden')}>{item.label}</span></NavLink>; })}
  </nav>;
  const sidebarContent = <>
    <div className={cn('flex h-[82px] items-center border-b border-slate-200/80 px-5', collapsed && 'justify-center px-3')}>
      <div className="flex items-center gap-3 overflow-hidden"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-indigo-900/10"><Boxes className="h-5 w-5" /></div><div className={cn('min-w-0', collapsed && 'hidden')}><p className="font-extrabold tracking-tight text-slate-950">OpsFlow</p><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-indigo-600">ERP · CRM</p></div></div>
    </div>
    {nav}
    <div className="mt-auto border-t border-slate-200/80 p-3">
      <div className={cn('flex items-center gap-3 rounded-xl bg-slate-50 p-2.5', collapsed && 'justify-center')}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{user ? initials(user.name) : '?'}</div>
        <div className={cn('min-w-0 flex-1', collapsed && 'hidden')}><p className="truncate text-sm font-bold text-slate-700">{user?.name}</p><p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{user?.role}</p></div>
        <button onClick={signOut} className={cn('rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700', collapsed && 'hidden')} aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
      </div>
    </div>
  </>;
  return <div className="min-h-screen bg-[#f7f8fb]">
    <aside className={cn('no-print fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200/80 bg-white transition-[width] duration-200 lg:flex', collapsed ? 'w-[76px]' : 'w-[260px]')}>
      {sidebarContent}
      <button onClick={() => setCollapsed((value) => !value)} className="absolute -right-3 top-[96px] grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md hover:text-indigo-700" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}</button>
    </aside>
    {mobileOpen && <div className="no-print fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden" onMouseDown={() => setMobileOpen(false)}><aside className="flex h-full w-[290px] flex-col bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex justify-end px-3 pt-3"><button onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close navigation"><X className="h-5 w-5" /></button></div>{sidebarContent}</aside></div>}
    <div className={cn('min-h-screen transition-[margin] duration-200', collapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]')}>
      <header className="no-print sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
        <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button><div><p className="text-[11px] font-semibold uppercase tracking-[.12em] text-slate-400">Workspace / {currentName}</p><p className="mt-0.5 font-bold text-slate-900">{currentName}</p></div></div>
        <div className="flex items-center gap-3"><button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-indigo-700" aria-label="Notifications"><Bell className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" /></button><div className="hidden h-8 w-px bg-slate-200 sm:block" /><div className="hidden items-center gap-2 sm:flex"><div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{user ? initials(user.name) : '?'}</div><div><p className="max-w-32 truncate text-xs font-bold text-slate-700">{user?.name}</p><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{user?.role}</p></div></div></div>
      </header>
      <main className="mx-auto w-full max-w-[1680px] px-4 py-7 sm:px-7 lg:px-9"><Outlet /></main>
    </div>
  </div>;
}
