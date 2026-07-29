'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { ToastProvider } from '@/components/ui/Toast';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useDemoSimulation } from '@/hooks/useDemoSimulation';

function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useDemoSimulation();

  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  if (isLoginPage || isLandingPage) {
    return <>{children}</>;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('fsos_token') : null;
  if (!token && pathname !== '/login') {
    router.push('/login');
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-aethelos-bg">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoBanner />
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
      <OnboardingTour />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-aethelos-bg">{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
