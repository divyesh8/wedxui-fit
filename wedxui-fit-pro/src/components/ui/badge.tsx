import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'purple' | 'blue' | 'lime' | 'pink' | 'outline' | 'secondary';
  size?: 'sm' | 'default';
}

function Badge({ className, variant = 'default', size = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-wed-purple focus:ring-offset-2',
        size === 'sm' && 'px-2 py-0 text-[10px]',
        variant === 'default' && 'border-transparent bg-wed-purple/20 text-wed-purple',
        variant === 'purple' && 'border-transparent bg-wed-purple text-white',
        variant === 'blue' && 'border-transparent bg-wed-blue/20 text-wed-blue',
        variant === 'lime' && 'border-transparent bg-wed-lime/20 text-wed-lime',
        variant === 'pink' && 'border-transparent bg-wed-pink/20 text-wed-pink',
        variant === 'outline' && 'border-white/20 text-white bg-transparent',
        variant === 'secondary' && 'border-transparent bg-white/10 text-wed-gray-200',
        className
      )}
      {...props}
    />
  );
}

export { Badge };
