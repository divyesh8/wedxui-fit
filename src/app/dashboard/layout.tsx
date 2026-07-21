'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';
import { AppearanceProvider } from '@/components/providers/appearance-provider';
import { useAuthStore } from '@/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status, refresh } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Middleware already gates these routes server-side; this hydrates the user
  // into the client cache and redirects as a fallback if the session is gone.
  useEffect(() => {
    refresh().then((user) => {
      if (!user) router.replace('/login');
    });
  }, [refresh, router]);

  if (status !== 'authenticated') return null;

  return (
    <div className="min-h-screen bg-wed-black">
      <AppearanceProvider />
      <DashboardSidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
      <div className="lg:ml-64 transition-all duration-300">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        {/* pb-28 clears the fixed mobile tab bar; lg reverts to normal padding. */}
        <main className="p-4 pb-28 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
