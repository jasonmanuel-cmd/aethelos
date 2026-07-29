'use client';

import { useState, useEffect } from 'react';
import { getInitials } from '@/lib/utils';
import { getStoredUser } from '@/lib/api-client';

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<any>(null);
  useEffect(() => { setUser(getStoredUser()); }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-aethelos-border bg-white/80 backdrop-blur-md shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-aethelos-text-secondary hover:text-aethelos-text transition-colors rounded-lg hover:bg-aethelos-card"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="h-5 w-px bg-aethelos-border" />
        <div className="flex items-center gap-2 text-sm text-aethelos-text-secondary">
          <span className="text-aethelos-primary">◆</span>
          <span className="font-medium text-aethelos-text">AethelOS</span>
          <span className="text-aethelos-muted">/</span>
          <span>FSOS</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 relative text-aethelos-text-secondary hover:text-aethelos-text transition-colors rounded-lg hover:bg-aethelos-card">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-aethelos-accent rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-aethelos-text">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-aethelos-muted">Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-aethelos-primary to-aethelos-secondary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user ? getInitials(user.first_name, user.last_name) : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
