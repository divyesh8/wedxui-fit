import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wed-purple disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-purple text-white shadow-lg hover:shadow-wed-purple/25 hover:brightness-110',
        destructive: 'bg-red-600 text-white shadow-lg hover:bg-red-700',
        outline: 'border border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-white/30',
        secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
        ghost: 'text-white hover:bg-white/5',
        link: 'text-wed-blue underline-offset-4 hover:underline',
        glow: 'bg-wed-purple text-white btn-glow hover:brightness-110',
        blue: 'bg-gradient-blue text-white shadow-lg hover:shadow-wed-blue/25 hover:brightness-110',
        lime: 'bg-wed-lime text-wed-black shadow-lg hover:brightness-110 font-bold',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        xl: 'h-14 px-10 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
