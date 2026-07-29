'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/leads', label: 'Leads', icon: '⇝' },
  { href: '/pipeline', label: 'Pipeline', icon: '⤨' },
  { href: '/clients', label: 'Clients', icon: '⯐' },
  { href: '/assessments', label: 'Assessments', icon: '⊞' },
  { href: '/appointments', label: 'Appointments', icon: '⊡' },
  { href: '/workflows', label: 'Workflows', icon: '⇆' },
  { href: '/agents', label: 'AI Agents', icon: '⌘' },
  { href: '/analytics', label: 'Analytics', icon: '≣' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className={cn(
      'flex flex-col transition-all duration-300 z-30 bg-gradient-to-b from-[#1E3A5F] to-[#2B4C7C] border-r border-white/5 shadow-xl',
      open ? 'w-[230px]' : 'w-0 -ml-56',
    )}>
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white font-bold text-sm shadow-sm backdrop-blur-sm">
          A
        </div>
        <div>
          <h1 className="text-sm font-bold text-white font-display">Aethel<span className="text-emerald-300">OS</span></h1>
          <p className="text-[10px] text-blue-200/60 -mt-0.5">Chaotically Organized AI</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-white/10 text-white font-medium shadow-sm border border-white/5'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/5'
              )}
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5 shrink-0">
        <button
          onClick={() => { localStorage.clear(); router.push('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="text-base w-5 text-center shrink-0">↩</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
