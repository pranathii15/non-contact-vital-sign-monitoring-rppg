'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, Mail, X, Bell } from 'lucide-react';
import { useVitals } from '@/lib/vital-context';
import { GlowButton } from '@/components/ui/glow-button';
import { toast } from 'sonner';

export function AlertOverlay() {
  const { isAlertActive, dismissAlert, currentVitals, vitalStatus } = useVitals();

  const handleNotifyCaretaker = async () => {
    // Simulate API call to send notification
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Sending alert to caretaker...',
        success: 'Alert sent to Jane Doe successfully!',
        error: 'Failed to send alert',
      }
    );
  };

  return (
    <AnimatePresence>
      {isAlertActive && vitalStatus !== 'normal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
          />

          {/* Pulsing rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full border-2 ${
                  vitalStatus === 'critical' ? 'border-critical/30' : 'border-warning/30'
                }`}
                initial={{ width: 100, height: 100, opacity: 1 }}
                animate={{
                  width: [100, 400 + i * 100],
                  height: [100, 400 + i * 100],
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Alert card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`relative z-10 w-full max-w-md glass-card p-8 ${
              vitalStatus === 'critical' ? 'glow-critical' : 'glow-warning'
            }`}
          >
            {/* Close button */}
            <button
              onClick={dismissAlert}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-glass transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Icon */}
            <motion.div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                vitalStatus === 'critical' ? 'bg-critical/20' : 'bg-warning/20'
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle
                className={`w-10 h-10 ${
                  vitalStatus === 'critical' ? 'text-critical' : 'text-warning'
                }`}
              />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              {vitalStatus === 'critical' ? 'Critical Alert' : 'Warning Alert'}
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Abnormal vital signs detected. Please take appropriate action.
            </p>

            {/* Vitals */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-3 rounded-xl bg-glass">
                <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                <p
                  className={`text-xl font-bold ${
                    currentVitals.heartRate > 100 || currentVitals.heartRate < 50
                      ? vitalStatus === 'critical'
                        ? 'text-critical'
                        : 'text-warning'
                      : 'text-foreground'
                  }`}
                >
                  {currentVitals.heartRate}
                </p>
                <p className="text-xs text-muted-foreground">BPM</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-glass">
                <p className="text-xs text-muted-foreground mb-1">Resp. Rate</p>
                <p
                  className={`text-xl font-bold ${
                    currentVitals.respiratoryRate > 25 || currentVitals.respiratoryRate < 10
                      ? vitalStatus === 'critical'
                        ? 'text-critical'
                        : 'text-warning'
                      : 'text-foreground'
                  }`}
                >
                  {currentVitals.respiratoryRate}
                </p>
                <p className="text-xs text-muted-foreground">br/min</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-glass">
                <p className="text-xs text-muted-foreground mb-1">SpO2</p>
                <p
                  className={`text-xl font-bold ${
                    currentVitals.spo2 < 92
                      ? vitalStatus === 'critical'
                        ? 'text-critical'
                        : 'text-warning'
                      : 'text-foreground'
                  }`}
                >
                  {currentVitals.spo2}
                </p>
                <p className="text-xs text-muted-foreground">%</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <GlowButton
                variant="destructive"
                size="lg"
                className="w-full"
                onClick={handleNotifyCaretaker}
                icon={<Bell className="w-5 h-5" />}
              >
                Notify Caretaker
              </GlowButton>
              <div className="grid grid-cols-2 gap-3">
                <GlowButton
                  variant="secondary"
                  size="md"
                  className="w-full"
                  icon={<Phone className="w-4 h-4" />}
                  onClick={() => window.open('tel:911')}
                >
                  Call 911
                </GlowButton>
                <GlowButton
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={dismissAlert}
                >
                  Dismiss
                </GlowButton>
              </div>
            </div>

            {/* Info text */}
            <p className="text-xs text-center text-muted-foreground mt-6">
              This alert will auto-dismiss in 30 seconds if no action is taken.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
