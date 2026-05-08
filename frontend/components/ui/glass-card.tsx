'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle';
  glow?: 'none' | 'primary' | 'success' | 'warning' | 'critical';
  hover?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = 'default', glow = 'none', hover = true, ...props }, ref) => {
    const variants = {
      default: 'glass-card',
      elevated: 'glass-card shadow-2xl',
      subtle: 'bg-glass/30 backdrop-blur-md border border-glass-border/50 rounded-2xl',
    };

    const glowStyles = {
      none: '',
      primary: 'glow-primary',
      success: 'glow-success',
      warning: 'glow-warning',
      critical: 'glow-critical',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          variants[variant],
          glowStyles[glow],
          hover && 'transition-all duration-300',
          className
        )}
        whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
