'use client';


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Wind, Droplets } from 'lucide-react';
import { VitalCard } from '@/components/dashboard/vital-card';
import { ECGChart } from '@/components/dashboard/ecg-chart';
import { CameraFeed } from '@/components/dashboard/camera-feed';
import { PatientCard } from '@/components/dashboard/patient-card';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { useVitals } from '@/lib/vital-context';
import { useUser } from "@/lib/user-context";
import { ALERT_THRESHOLDS } from '@/lib/types';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

function getVitalStatus(
  value: number,
  type: 'heartRate' | 'respiratoryRate' | 'spo2'
): 'normal' | 'warning' | 'critical' {
  const thresholds = ALERT_THRESHOLDS[type] as {
    min: number;
    max: number;
  };

  if (type === 'spo2') {
    if (value < 90) return 'critical';
    if (value < thresholds.min) return 'warning';
    return 'normal';
  }

  if (value < thresholds.min - 10 || value > thresholds.max + 20)
    return 'critical';
  if (value < thresholds.min || value > thresholds.max)
    return 'warning';

  return 'normal';
}

export default function DashboardPage() {
  const { currentVitals, status } = useVitals();
  const { user } = useUser();

  // ✅ FIX: prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [lastSent, setLastSent] = useState(0);

  useEffect(() => {
    setMounted(true);
    setTime(new Date().toLocaleTimeString());
  }, []);

  // ✅ ALERT FUNCTION
  const sendAlerts = async (vitals: any) => {
    if (!user) return;

    const { hr, spo2, rr } = vitals;
    if (hr === 0 || spo2 === 0 || rr === 0) return;

    const isAbnormal =
      hr < 50 || hr > 120 ||
      spo2 < 92 ||
      rr < 10 || rr > 25;

    const message = `Vitals Report:
HR: ${hr}
SpO2: ${spo2}
RR: ${rr}
Status: ${isAbnormal ? "🚨 ABNORMAL" : "Normal"}`;

    // USER always
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        emails: [user.email],
      }),
    });

    await fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        phone: user.phone,
      }),
    });

    // CARETAKER if abnormal
    if (isAbnormal) {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "🚨 EMERGENCY!\n" + message,
          emails: [user.caretakerEmail],
        }),
      });

      await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "🚨 EMERGENCY!\n" + message,
          phone: user.caretakerPhone,
        }),
      });

      // 🔁 repeated alert
      let count = 0;

      const interval = setInterval(async () => {
        if (count >= 5) return clearInterval(interval);

        await fetch("/api/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "🚨 URGENT! CHECK PATIENT NOW!",
            phone: user.caretakerPhone,
          }),
        });

        count++;
      }, 10000);
    }
  };

  // ✅ TRIGGER ALERTS
  useEffect(() => {
    if (!currentVitals || !user) return;

    const now = Date.now();

    if (now - lastSent < 10000) return; // 10 sec gap

    sendAlerts({
      hr: currentVitals.heartRate,
      spo2: currentVitals.spo2,
      rr: currentVitals.respiratoryRate,
    });

    setLastSent(now);
  }, [currentVitals]);
  
  const vitals = [
    {
      title: 'Heart Rate',
      value: currentVitals.heartRate,
      unit: 'BPM',
      icon: Heart,
      status: getVitalStatus(currentVitals.heartRate, 'heartRate'),
      range: '50-100 BPM',
      trend: 'stable' as const,
    },
    {
      title: 'Respiratory Rate',
      value: currentVitals.respiratoryRate,
      unit: 'br/min',
      icon: Wind,
      status: getVitalStatus(
        currentVitals.respiratoryRate,
        'respiratoryRate'
      ),
      range: '10-25 br/min',
      trend: 'stable' as const,
    },
    {
      title: 'Blood Oxygen (SpO2)',
      value: currentVitals.spo2,
      unit: '%',
      icon: Droplets,
      status: getVitalStatus(currentVitals.spo2, 'spo2'),
      range: '92-100%',
      trend: 'stable' as const,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Vital Cards Row */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vitals.map((vital) => (
            <VitalCard
              key={vital.title}
              title={vital.title}
              value={vital.value}
              unit={vital.unit}
              icon={vital.icon}
              status={vital.status}
              range={vital.range}
              trend={vital.trend}
            />
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <CameraFeed />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ECGChart />
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <PatientCard />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AIInsights />
          </motion.div>
        </div>
      </div>

      {/* Status Bar */}
      <motion.div variants={itemVariants}>
        <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  status === 'monitoring'
                    ? 'bg-success animate-pulse'
                    : status === 'stopped'
                    ? 'bg-warning'
                    : 'bg-muted'
                }`}
              />
              <span className="text-sm font-medium text-foreground">
                {status === 'monitoring'
                  ? 'Monitoring Active'
                  : status === 'stopped'
                  ? 'Monitoring Paused'
                  : 'Ready to Start'}
              </span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-border" />

            {/* ✅ FIXED TIME */}
            <span className="text-sm text-muted-foreground">
              Last updated: {mounted ? time : '--:--:--'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Normal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">Warning</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-critical" />
              <span className="text-muted-foreground">Critical</span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}