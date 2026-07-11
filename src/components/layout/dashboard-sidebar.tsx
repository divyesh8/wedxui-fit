'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Dumbbell,
  Search,
  Trophy,
  Calculator,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/dashboard/exercises', label: 'Exercises', icon: Search },
  { href: '/dashboard/challenges', label: 'Challenges', icon: Trophy },
  { href: '/dashboard/tools', label: 'Tools', icon: Calculator },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function DashboardSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-wed-surface border-r border-white/5 flex flex-col transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
          <Link href="/dashboard" className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
            <span className="text-xl font-black">
              <span className="text-white">WED</span>
              <span className="text-wed-purple">XUI</span>
            </span>
            {!collapsed && <span className="text-white font-light text-sm">Fit</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-white/5 text-wed-gray-400 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-wed-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-wed-purple/15 text-wed-purple border border-wed-purple/20'
                    : 'text-wed-gray-400 hover:text-white hover:bg-white/5',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-wed-purple')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            href="#"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-wed-gray-400 hover:text-white hover:bg-white/5 transition-all',
              collapsed && 'justify-center'
            )}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-wed-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
