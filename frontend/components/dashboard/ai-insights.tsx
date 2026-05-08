// 'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, AlertTriangle, AlertCircle, Lightbulb, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useVitals } from '@/lib/vital-context';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const typeConfig = {
  normal: {
    icon: CheckCircle2,
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
    borderColor: 'border-l-success',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-warning/20',
    iconColor: 'text-warning',
    borderColor: 'border-l-warning',
  },
  critical: {
    icon: AlertCircle,
    iconBg: 'bg-critical/20',
    iconColor: 'text-critical',
    borderColor: 'border-l-critical',
  },
  suggestion: {
    icon: Lightbulb,
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    borderColor: 'border-l-primary',
  },
};

export function AIInsights() {
  const { currentVitals, status } = useVitals(); // ✅ changed

  // ✅ GENERATE DYNAMIC INSIGHTS
  const generateInsights = () => {
    const insights = [];

    const now = new Date();

    // ❤️ Heart Rate
    if (currentVitals.heartRate < 60) {
      insights.push({
        id: 'hr-low',
        type: 'warning',
        message: 'Heart rate is low. Consider light movement.',
        timestamp: now,
      });
    } else if (currentVitals.heartRate > 100) {
      insights.push({
        id: 'hr-high',
        type: 'critical',
        message: 'Heart rate is high. Try to relax.',
        timestamp: now,
      });
    } else {
      insights.push({
        id: 'hr-normal',
        type: 'normal',
        message: `Heart rate is stable at ${currentVitals.heartRate} BPM.`,
        timestamp: now,
      });
    }

    // 🫁 SpO2
    if (currentVitals.spo2 < 92) {
      insights.push({
        id: 'spo2-low',
        type: 'critical',
        message: 'SpO2 levels are low. Ensure proper breathing.',
        timestamp: now,
      });
    } else {
      insights.push({
        id: 'spo2-good',
        type: 'normal',
        message: `SpO2 levels are excellent at ${currentVitals.spo2}%.`,
        timestamp: now,
      });
    }

    // 🌬 Respiratory Rate
    if (currentVitals.respiratoryRate > 25) {
      insights.push({
        id: 'rr-high',
        type: 'warning',
        message: 'Breathing rate is high. Try to stay calm.',
        timestamp: now,
      });
    } else {
      insights.push({
        id: 'rr-normal',
        type: 'normal',
        message: 'Respiratory rate is within normal range.',
        timestamp: now,
      });
    }

    // 💡 Suggestion
    insights.push({
      id: 'tip',
      type: 'suggestion',
      message: 'Consider taking a short break to maintain optimal health.',
      timestamp: now,
    });

    return insights;
  };

  const insights = generateInsights(); // ✅ replaced static data

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center"
            animate={
              status === 'monitoring'
                ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-5 h-5 text-accent" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground">AI Health Insights</h3>
            <p className="text-sm text-muted-foreground">Intelligent analysis of your vitals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              status === 'monitoring' ? 'bg-accent animate-pulse' : 'bg-muted'
            )}
          />
          <span className="text-xs text-muted-foreground">
            {status === 'monitoring' ? 'Analyzing' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Insights list */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, index) => {
            const config = typeConfig[insight.type as keyof typeof typeConfig];
            const Icon = config.icon;

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  'p-4 rounded-xl bg-glass/50 border-l-4',
                  config.borderColor
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', config.iconBg)}>
                    <Icon className={cn('w-4 h-4', config.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{insight.message}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(insight.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {insights.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No insights yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start monitoring to receive AI analysis</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-glass-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total insights</span>
            <span className="font-medium text-foreground">{insights.length}</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}