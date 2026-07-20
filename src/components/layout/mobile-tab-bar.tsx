'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Dumbbell, Salad, LineChart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Primary navigation on phones — thumb-reachable, fixed to the bottom, and
 * padded for notch/home-indicator safe areas. Hidden at lg+ where the sidebar
 * takes over. Every target is ≥44px tall per mobile touch guidelines.
 */
const TABS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/workouts', label: 'Workout', icon: Dumbbell },
  { href: '/dashboard/diet', label: 'Diet', icon: Salad },
  { href: '/dashboard/progress', label: 'Progress', icon: LineChart },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.08] bg-black/80 backdrop-blur-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch">
        {TABS.map((tab) => {
          // Exact match for Home so it isn't active on every nested route.
          const active = tab.href === '/dashboard' ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 min-h-[56px] px-1 py-2 transition-colors',
                  active ? 'text-wed-purple' : 'text-wed-gray-400 active:text-white'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-wed-purple"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <tab.icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-medium leading-none tracking-tight">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
