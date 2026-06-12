'use client';

import { useState, useEffect } from 'react';
import { getInitials } from '@/lib/utils';
import { getStoredUser } from '@/lib/api-client';

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="btn-ghost p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="h-6 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>💰</span>
          <span className="font-medium">FSOS</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Financial Services OS</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="btn-ghost p-2 relative">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400">Agent</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fsos-400 to-brand-500 flex items-center justify-center text-white font-bold text-sm">
            {user ? getInitials(user.first_name, user.last_name) : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
