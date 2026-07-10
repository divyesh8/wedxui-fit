import * as React from 'react';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number; max?: number; variant?: 'default' | 'xp' | 'health' }
>(({ className, value = 0, max = 100, variant = 'default', ...props }, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div
      ref={ref}
      className={cn(
        'relative h-3 w-full overflow-hidden rounded-full bg-white/5',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          variant === 'default' && 'bg-gradient-purple',
          variant === 'xp' && 'bg-gradient-wed',
          variant === 'health' && 'bg-gradient-blue'
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});
Progress.displayName = 'Progress';

export { Progress };
