'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Search } from 'lucide-react';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';
  const [initial, setInitial] = useState('?');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => setInitial((data.user?.name ?? '?').charAt(0).toUpperCase()))
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 glass-strong border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-wed-gray-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white capitalize">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
          <Search className="w-4 h-4 text-wed-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-white placeholder:text-wed-gray-500 focus:outline-none w-32 lg:w-48"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-white/5 text-wed-gray-400 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white text-xs font-bold">
          {initial}
        </Link>
      </div>
    </header>
  );
}
