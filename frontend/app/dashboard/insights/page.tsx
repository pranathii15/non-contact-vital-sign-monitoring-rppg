'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Calendar,
  Clock,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { useVitals } from '@/lib/vital-context';
import { mockVitalHistory } from '@/lib/mock-data';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// AI-generated recommendations
const recommendations = [
  {
    icon: Heart,
    title: 'Cardiovascular Health',
    status: 'good',
    message: 'Your heart rate patterns indicate healthy cardiovascular function. Continue your current lifestyle habits.',
    tips: ['Maintain 30 minutes of daily exercise', 'Stay hydrated throughout the day'],
  },
  {
    icon: Wind,
    title: 'Respiratory Function',
    status: 'good',
    message: 'Breathing patterns are within optimal range. Your respiratory health appears stable.',
    tips: ['Practice deep breathing exercises', 'Avoid exposure to pollutants'],
  },
  {
    icon: Droplets,
    title: 'Blood Oxygen Levels',
    status: 'excellent',
    message: 'SpO2 consistently above 95%. Excellent oxygen saturation levels indicate good lung function.',
    tips: ['Continue avoiding smoking', 'Regular outdoor activities help maintain levels'],
  },
];

// Weekly analysis data
const weeklyAnalysis = {
  averageHeartRate: 74,
  heartRateTrend: 'stable',
  averageRespRate: 16,
  respRateTrend: 'down',
  averageSpo2: 97,
  spo2Trend: 'up',
  totalReadings: mockVitalHistory.length,
  normalReadings: mockVitalHistory.filter((v) => v.status === 'normal').length,
  alertsTriggered: mockVitalHistory.filter((v) => v.status !== 'normal').length,
};

export default function AIInsightsPage() {
  const { insights, status } = useVitals();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-primary" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Health Insights</h1>
          <p className="text-muted-foreground">Personalized analysis powered by AI</p>
        </div>
        <GlowButton
          variant="secondary"
          onClick={handleRefresh}
          loading={isRefreshing}
          icon={<RefreshCw className={cn('w-5 h-5', isRefreshing && 'animate-spin')} />}
        >
          Refresh Analysis
        </GlowButton>
      </motion.div>

      {/* Weekly Summary */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Brain className="w-6 h-6 text-accent" />
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Weekly Health Summary</h2>
              <p className="text-sm text-muted-foreground">
                Based on {weeklyAnalysis.totalReadings} readings this week
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Heart Rate Summary */}
            <div className="p-4 rounded-xl bg-glass/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-critical" />
                  <span className="text-sm font-medium text-foreground">Heart Rate</span>
                </div>
                {getTrendIcon(weeklyAnalysis.heartRateTrend)}
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{weeklyAnalysis.averageHeartRate}</p>
              <p className="text-sm text-muted-foreground">avg BPM</p>
              <div className="mt-3 pt-3 border-t border-glass-border">
                <span className="text-xs text-success">Trend: Stable</span>
              </div>
            </div>

            {/* Respiratory Rate Summary */}
            <div className="p-4 rounded-xl bg-glass/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Resp. Rate</span>
                </div>
                {getTrendIcon(weeklyAnalysis.respRateTrend)}
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{weeklyAnalysis.averageRespRate}</p>
              <p className="text-sm text-muted-foreground">avg br/min</p>
              <div className="mt-3 pt-3 border-t border-glass-border">
                <span className="text-xs text-primary">Trend: Improving</span>
              </div>
            </div>

            {/* SpO2 Summary */}
            <div className="p-4 rounded-xl bg-glass/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-foreground">Blood Oxygen</span>
                </div>
                {getTrendIcon(weeklyAnalysis.spo2Trend)}
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{weeklyAnalysis.averageSpo2}%</p>
              <p className="text-sm text-muted-foreground">avg SpO2</p>
              <div className="mt-3 pt-3 border-t border-glass-border">
                <span className="text-xs text-success">Trend: Excellent</span>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-glass-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last 7 days analysis
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm text-foreground">
                {weeklyAnalysis.normalReadings} normal readings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm text-foreground">
                {weeklyAnalysis.alertsTriggered} alerts triggered
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-foreground mb-4">AI Recommendations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    rec.status === 'excellent' ? 'bg-success/20' : 'bg-primary/20'
                  )}>
                    <rec.icon className={cn(
                      'w-5 h-5',
                      rec.status === 'excellent' ? 'text-success' : 'text-primary'
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{rec.title}</h3>
                    <span className={cn(
                      'text-xs font-medium',
                      rec.status === 'excellent' ? 'text-success' : 'text-primary'
                    )}>
                      {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {rec.message}
                </p>
                <div className="space-y-2">
                  {rec.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{tip}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Insights */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent AI Insights</h2>
        <GlassCard className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {insights.map((insight, index) => {
                const typeConfig = {
                  normal: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/20' },
                  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/20' },
                  critical: { icon: AlertTriangle, color: 'text-critical', bg: 'bg-critical/20' },
                  suggestion: { icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/20' },
                };
                const config = typeConfig[insight.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-glass/30 hover:bg-glass/50 transition-colors"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bg)}>
                      <Icon className={cn('w-5 h-5', config.color)} />
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
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {insights.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No insights yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start monitoring to receive AI-powered insights
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
