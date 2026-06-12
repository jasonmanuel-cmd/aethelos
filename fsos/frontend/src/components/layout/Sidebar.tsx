'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/leads', label: 'Leads & Contacts', icon: '👥' },
  { href: '/pipeline', label: 'Pipeline', icon: '📊' },
  { href: '/clients', label: 'Clients', icon: '⭐' },
  { href: '/assessments', label: 'Assessments', icon: '📋' },
  { href: '/appointments', label: 'Appointments', icon: '📅' },
  { href: '/workflows', label: 'Workflows', icon: '⚡' },
  { href: '/agents', label: 'AI Agents', icon: '🤖' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className={cn(
      'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-30',
      open ? 'w-[260px]' : 'w-0 -ml-64',
    )}>
      <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fsos-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
          C
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900 font-display">FSOS</h1>
          <p className="text-[10px] text-gray-400 -mt-0.5">by Chaotically Organized AI</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'sidebar-link w-full text-left',
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => { localStorage.clear(); router.push('/login'); }}
          className="sidebar-link-inactive w-full text-left"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
