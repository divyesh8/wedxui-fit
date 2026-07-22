'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { physiqueById } from '@/data/knowledge/physiques';
import { goalProfiles, type GoalId } from '@/data/knowledge/volume-landmarks';
import { PHYSIQUE_ART } from '@/components/onboarding/physique-art';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
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
  { href: '/dashboard/diet', label: 'Diet', icon: Apple },
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
  // The physique the user actually chose in onboarding — never a placeholder.
  const [target, setTarget] = useState<{ physique: string; goal: string | null } | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.profile?.physique) {
          setTarget({ physique: d.profile.physique, goal: d.profile.goalsRanked?.[0] ?? null });
        }
      })
      .catch(() => {});
  }, []);

  const physique = target ? physiqueById(target.physique) : undefined;
  const PhysiqueArt = physique ? PHYSIQUE_ART[physique.silhouette] : undefined;
  const goalLabel = target?.goal ? goalProfiles[target.goal as GoalId]?.label : undefined;

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

        {/* Target physique — fills the sidebar gap with the user's real goal.
            Hidden when collapsed, and omitted entirely before onboarding. */}
        {physique && !collapsed && (
          <div className="px-3 pb-3">
            <Link
              href="/onboarding"
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-wed-purple/30 hover:bg-white/[0.06] transition-all group"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-wed-gray-500 mb-2">
                Target physique
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 flex-shrink-0">
                  {PhysiqueArt && <PhysiqueArt color="#FF3B30" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight truncate group-hover:text-wed-purple transition-colors">
                    {physique.name}
                  </p>
                  {goalLabel && (
                    <p className="text-[11px] text-wed-gray-400 truncate mt-0.5">{goalLabel}</p>
                  )}
                  <p className="text-[10px] text-wed-gray-500 mt-1">
                    {'★'.repeat(physique.difficulty)}
                    <span className="text-wed-gray-700">{'★'.repeat(5 - physique.difficulty)}</span>
                    <span className="ml-1.5">{physique.estimatedYears}</span>
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-wed-gray-400 hover:text-white hover:bg-white/5 transition-all',
              pathname === '/dashboard/settings' && 'bg-wed-purple/15 text-wed-purple border border-wed-purple/20',
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
