'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useVitals } from '@/lib/vital-context';
import { cn } from '@/lib/utils';

export function ECGChart() {
  const { ecgData, status, vitalStatus, currentVitals } = useVitals();

  const chartData = useMemo(() => {
    return ecgData.map((value, index) => ({
      index,
      value,
    }));
  }, [ecgData]);

  const strokeColor = useMemo(() => {
    switch (vitalStatus) {
      case 'critical':
        return 'oklch(0.60 0.24 25)';
      case 'warning':
        return 'oklch(0.75 0.18 80)';
      default:
        return 'oklch(0.70 0.18 160)';
    }
  }, [vitalStatus]);

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">ECG Waveform</h3>
            <p className="text-sm text-muted-foreground">Real-time electrocardiogram</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              status === 'monitoring' ? 'bg-success animate-pulse' : 'bg-muted'
            )}
          />
          <span className="text-sm text-muted-foreground">
            {status === 'monitoring' ? 'Live' : status === 'stopped' ? 'Stopped' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 relative">
        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">Start monitoring to view ECG</p>
          </div>
        )}
        
        {(status === 'monitoring' || status === 'stopped') && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="index"
                tick={false}
                axisLine={{ stroke: 'oklch(0.30 0.03 260 / 0.3)' }}
              />
              <YAxis
                domain={[-0.5, 1.5]}
                tick={false}
                axisLine={{ stroke: 'oklch(0.30 0.03 260 / 0.3)' }}
              />
              <ReferenceLine y={0} stroke="oklch(0.30 0.03 260 / 0.2)" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.70 0.18 160 / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.70 0.18 160 / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-glass-border">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Heart Rate</p>
            <p className="text-lg font-semibold text-foreground">{currentVitals.heartRate} BPM</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rhythm</p>
            <p className="text-lg font-semibold text-success">Sinus</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">QRS</p>
            <p className="text-lg font-semibold text-foreground">Normal</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="text-sm font-mono text-foreground">
            {status === 'monitoring' ? `${Math.floor(ecgData.length / 20)}s` : '--'}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
