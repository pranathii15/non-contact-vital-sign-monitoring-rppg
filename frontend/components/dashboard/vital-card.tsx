'use client';
 // VERY IMPORTANT in Next.js app router

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';

interface VitalCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'critical';
  range?: string;
  trend?: 'up' | 'down' | 'stable';
}

export function VitalCard({
  title,
  value,
  unit,
  icon: Icon,
  status,
  range,
  trend,
}: VitalCardProps) {
  const statusConfig = {
    normal: {
      glow: 'glow-success' as const,
      iconBg: 'bg-success/20',
      iconColor: 'text-success',
      valueColor: 'text-success',
      label: 'Normal',
      labelBg: 'bg-success/20 text-success',
    },
    warning: {
      glow: 'glow-warning' as const,
      iconBg: 'bg-warning/20',
      iconColor: 'text-warning',
      valueColor: 'text-warning',
      label: 'Warning',
      labelBg: 'bg-warning/20 text-warning',
    },
    critical: {
      glow: 'glow-critical' as const,
      iconBg: 'bg-critical/20',
      iconColor: 'text-critical',
      valueColor: 'text-critical',
      label: 'Critical',
      labelBg: 'bg-critical/20 text-critical',
    },
  };

  const config = statusConfig[status];

  return (
    <GlassCard
      className={cn('p-6 relative overflow-hidden', status !== 'normal' && config.glow)}
      glow="none"
    >
      {/* Background pulse for alerts */}
      {status !== 'normal' && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-2xl',
            status === 'critical' ? 'bg-critical/5' : 'bg-warning/5'
          )}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.iconBg)}>
            <Icon className={cn('w-6 h-6', config.iconColor)} />
          </div>
          <span className={cn('text-xs font-medium px-3 py-1 rounded-full', config.labelBg)}>
            {config.label}
          </span>
        </div>

        {/* Value */}
        <div className="mb-2">
          <AnimatedNumber
            value={value}
            className={cn('text-4xl font-bold', config.valueColor)}
          />
          <span className="text-lg text-muted-foreground ml-2">{unit}</span>
        </div>

        {/* Title */}
        <p className="text-sm text-muted-foreground mb-3">{title}</p>

        {/* Range indicator */}
        {range && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', {
                  'bg-success': status === 'normal',
                  'bg-warning': status === 'warning',
                  'bg-critical': status === 'critical',
                })}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{range}</span>
          </div>
        )}

        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <motion.div
              animate={
                trend === 'stable'
                  ? {}
                  : { y: trend === 'up' ? [-2, 0] : [0, 2] }
              }
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            >
              {trend === 'up' && <span className="text-warning text-sm">↑</span>}
              {trend === 'down' && <span className="text-success text-sm">↓</span>}
              {trend === 'stable' && <span className="text-muted-foreground text-sm">→</span>}
            </motion.div>
            <span className="text-xs text-muted-foreground">
              {trend === 'up' && 'Increasing'}
              {trend === 'down' && 'Decreasing'}
              {trend === 'stable' && 'Stable'}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
