'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface GlowButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ 
    className, 
    children, 
    variant = 'primary', 
    size = 'md', 
    glow = true, 
    loading = false,
    icon,
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      primary: cn(
        'bg-primary text-primary-foreground',
        glow && 'hover:shadow-[0_0_30px_oklch(0.65_0.18_250_/_0.5)]'
      ),
      secondary: cn(
        'glass-button text-foreground',
        glow && 'hover:shadow-[0_0_20px_oklch(0.55_0.22_280_/_0.3)]'
      ),
      ghost: cn(
        'bg-transparent hover:bg-glass text-foreground',
        'border border-transparent hover:border-glass-border'
      ),
      destructive: cn(
        'bg-destructive text-destructive-foreground',
        glow && 'hover:shadow-[0_0_30px_oklch(0.60_0.22_25_/_0.5)]'
      ),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium',
          'transition-all duration-300 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </motion.button>
    );
  }
);

GlowButton.displayName = 'GlowButton';

export { GlowButton };
