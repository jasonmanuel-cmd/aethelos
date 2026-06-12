'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gray-50">{children}</body>
      </html>
    );
  }

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <html lang="en">
        <body className="min-h-screen">{children}</body>
      </html>
    );
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('fsos_token') : null;
  if (!token && pathname !== '/login') {
    router.push('/login');
    return (
      <html lang="en">
        <body className="min-h-screen bg-gray-50">{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 overflow-y-auto bg-gray-50 scrollbar-thin">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
