// 'use client';

// import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
// import { VitalReading, MonitoringStatus, AIInsight } from './types';
// import { generateRandomVitals, getVitalStatus, mockAIInsights } from './mock-data';

// interface VitalContextType {
//   currentVitals: {
//     heartRate: number;
//     respiratoryRate: number;
//     spo2: number;
//   };
//   status: MonitoringStatus;
//   vitalStatus: 'normal' | 'warning' | 'critical';
//   isAlertActive: boolean;
//   insights: AIInsight[];
//   startMonitoring: () => void;
//   stopMonitoring: () => void;
//   dismissAlert: () => void;
//   ecgData: number[];
//   timeRemaining: number;
//   isMonitoringComplete: boolean;
// }

// const VitalContext = createContext<VitalContextType | undefined>(undefined);

// const MONITORING_DURATION = 15; // 15 seconds

// export function VitalProvider({ children }: { children: React.ReactNode }) {
//   const [currentVitals, setCurrentVitals] = useState({
//     heartRate: 0,
//     respiratoryRate: 0,
//     spo2: 0,
//   });
//   const [status, setStatus] = useState<MonitoringStatus>('idle');
//   const [isAlertActive, setIsAlertActive] = useState(false);
//   const [insights, setInsights] = useState<AIInsight[]>(mockAIInsights);
//   const [ecgData, setEcgData] = useState<number[]>([]);
//   const [timeRemaining, setTimeRemaining] = useState(MONITORING_DURATION);
//   const [isMonitoringComplete, setIsMonitoringComplete] = useState(false);
  
//   const monitoringInterval = useRef<NodeJS.Timeout | null>(null);
//   const ecgInterval = useRef<NodeJS.Timeout | null>(null);
//   const timerInterval = useRef<NodeJS.Timeout | null>(null);
//   const ecgIndex = useRef(0);
//   const onStopCallbackRef = useRef<(() => void) | null>(null);

//   const vitalStatus = getVitalStatus(
//     currentVitals.heartRate,
//     currentVitals.respiratoryRate,
//     currentVitals.spo2
//   );

//   const generateECGPoint = useCallback(() => {
//     const t = ecgIndex.current / 10;
//     let y = 0;
    
//     y += Math.sin(t * 0.1) * 0.02;
    
//     const pWave = Math.exp(-Math.pow((t % 10) - 1, 2) / 0.2) * 0.15;
//     y += pWave;
    
//     const qrs = (t % 10);
//     if (qrs > 2 && qrs < 2.3) {
//       y -= 0.1;
//     } else if (qrs >= 2.3 && qrs < 2.5) {
//       y += 1;
//     } else if (qrs >= 2.5 && qrs < 2.8) {
//       y -= 0.15;
//     }
    
//     const tWave = Math.exp(-Math.pow((t % 10) - 4, 2) / 0.5) * 0.25;
//     y += tWave;
    
//     ecgIndex.current += 1;
//     return y;
//   }, []);

//   const clearAllIntervals = useCallback(() => {
//     if (monitoringInterval.current) {
//       clearInterval(monitoringInterval.current);
//       monitoringInterval.current = null;
//     }
//     if (ecgInterval.current) {
//       clearInterval(ecgInterval.current);
//       ecgInterval.current = null;
//     }
//     if (timerInterval.current) {
//       clearInterval(timerInterval.current);
//       timerInterval.current = null;
//     }
//   }, []);

//   const stopMonitoring = useCallback(() => {
//     clearAllIntervals();
//     setStatus('stopped');
//     setIsMonitoringComplete(true);
//     // Vitals remain frozen at their last values
//     // Call the camera stop callback if registered
//     if (onStopCallbackRef.current) {
//       onStopCallbackRef.current();
//     }
//   }, [clearAllIntervals]);

//   const startMonitoring = useCallback(() => {
//     // Reset states
//     setStatus('monitoring');
//     setIsMonitoringComplete(false);
//     setEcgData([]);
//     setTimeRemaining(MONITORING_DURATION);
//     ecgIndex.current = 0;

//     // Initialize with first reading
//     const initialVitals = generateRandomVitals();
//     setCurrentVitals(initialVitals);

//     // Generate vitals every 2 seconds during monitoring
//     monitoringInterval.current = setInterval(() => {
//       const newVitals = generateRandomVitals();
//       setCurrentVitals(newVitals);
      
//       const newStatus = getVitalStatus(newVitals.heartRate, newVitals.respiratoryRate, newVitals.spo2);
      
//       if (newStatus === 'critical' || newStatus === 'warning') {
//         setIsAlertActive(true);
        
//         const newInsight: AIInsight = {
//           id: Date.now().toString(),
//           type: newStatus,
//           message: newStatus === 'critical' 
//             ? `Critical alert: Heart rate ${newVitals.heartRate} BPM, SpO2 ${newVitals.spo2}%. Immediate attention recommended.`
//             : `Warning: Vital signs slightly elevated. Heart rate: ${newVitals.heartRate} BPM. Continue monitoring.`,
//           timestamp: new Date(),
//         };
//         setInsights(prev => [newInsight, ...prev.slice(0, 9)]);
//       }
//     }, 2000);

//     // Generate ECG data points
//     ecgInterval.current = setInterval(() => {
//       setEcgData(prev => {
//         const newData = [...prev, generateECGPoint()];
//         if (newData.length > 200) {
//           return newData.slice(-200);
//         }
//         return newData;
//       });
//     }, 50);

//     // Timer countdown - auto-stop after 15 seconds
//     let countdown = MONITORING_DURATION;
//     timerInterval.current = setInterval(() => {
//       countdown -= 1;
//       setTimeRemaining(countdown);
      
//       if (countdown <= 0) {
//         stopMonitoring();
//       }
//     }, 1000);
//   }, [generateECGPoint, stopMonitoring]);

//   const dismissAlert = useCallback(() => {
//     setIsAlertActive(false);
//   }, []);

//   // Play alert sound when alert is active
//   useEffect(() => {
//     if (isAlertActive && typeof window !== 'undefined') {
//       const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
//       const oscillator = audioContext.createOscillator();
//       const gainNode = audioContext.createGain();
      
//       oscillator.connect(gainNode);
//       gainNode.connect(audioContext.destination);
      
//       oscillator.frequency.value = 800;
//       oscillator.type = 'sine';
//       gainNode.gain.value = 0.3;
      
//       oscillator.start();
      
//       setTimeout(() => {
//         oscillator.stop();
//         audioContext.close();
//       }, 500);
//     }
//   }, [isAlertActive]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       clearAllIntervals();
//     };
//   }, [clearAllIntervals]);

//   // Expose a way to register camera stop callback
//   useEffect(() => {
//     (window as typeof window & { __vitalStopCallback?: (cb: () => void) => void }).__vitalStopCallback = (cb: () => void) => {
//       onStopCallbackRef.current = cb;
//     };
//     return () => {
//       delete (window as typeof window & { __vitalStopCallback?: (cb: () => void) => void }).__vitalStopCallback;
//     };
//   }, []);

//   return (
//     <VitalContext.Provider
//       value={{
//         currentVitals,
//         status,
//         vitalStatus,
//         isAlertActive,
//         insights,
//         startMonitoring,
//         stopMonitoring,
//         dismissAlert,
//         ecgData,
//         timeRemaining,
//         isMonitoringComplete,
//       }}
//     >
//       {children}
//     </VitalContext.Provider>
//   );
// }

// export function useVitals() {
//   const context = useContext(VitalContext);
//   if (context === undefined) {
//     throw new Error('useVitals must be used within a VitalProvider');
//   }
//   return context;
// }

'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { VitalReading, MonitoringStatus, AIInsight } from './types';
import { generateRandomVitals, getVitalStatus, mockAIInsights } from './mock-data';
import { toast } from "sonner"; // ✅ ADDED
import { useUser } from "@/lib/user-context"; // ✅ ADDED

// ✅ ALERT FUNCTION
const checkForAlerts = (vitals: any) => {
  const alerts: string[] = [];

  if (vitals.heartRate > 110) {
    alerts.push("🚨 High heart rate detected!");
  } else if (vitals.heartRate < 50) {
    alerts.push("⚠️ Low heart rate detected!");
  }

  if (vitals.spo2 < 92) {
    alerts.push("🚨 Low oxygen level detected!");
  }

  if (vitals.respiratoryRate > 25) {
    alerts.push("⚠️ High breathing rate detected!");
  }

  return alerts;
};

interface VitalContextType {
  currentVitals: {
    heartRate: number;
    respiratoryRate: number;
    spo2: number;
  };
  status: MonitoringStatus;
  vitalStatus: 'normal' | 'warning' | 'critical';
  isAlertActive: boolean;
  insights: AIInsight[];
  startMonitoring: () => void;
  stopMonitoring: () => void;
  dismissAlert: () => void;
  ecgData: number[];
  timeRemaining: number;
  isMonitoringComplete: boolean;
}

const VitalContext = createContext<VitalContextType | undefined>(undefined);

const MONITORING_DURATION = 15;

export function VitalProvider({ children }: { children: React.ReactNode }) {

  const { user, familyMembers } = useUser(); // ✅ ADDED

  const [currentVitals, setCurrentVitals] = useState({
    heartRate: 0,
    respiratoryRate: 0,
    spo2: 0,
  });

  const [status, setStatus] = useState<MonitoringStatus>('idle');
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>(mockAIInsights);
  const [ecgData, setEcgData] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(MONITORING_DURATION);
  const [isMonitoringComplete, setIsMonitoringComplete] = useState(false);
  
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);
  const ecgInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const ecgIndex = useRef(0);
  const onStopCallbackRef = useRef<(() => void) | null>(null);

  const vitalStatus = getVitalStatus(
    currentVitals.heartRate,
    currentVitals.respiratoryRate,
    currentVitals.spo2
  );

  const generateECGPoint = useCallback(() => {
    const t = ecgIndex.current / 10;
    let y = 0;
    
    y += Math.sin(t * 0.1) * 0.02;
    
    const pWave = Math.exp(-Math.pow((t % 10) - 1, 2) / 0.2) * 0.15;
    y += pWave;
    
    const qrs = (t % 10);
    if (qrs > 2 && qrs < 2.3) y -= 0.1;
    else if (qrs >= 2.3 && qrs < 2.5) y += 1;
    else if (qrs >= 2.5 && qrs < 2.8) y -= 0.15;
    
    const tWave = Math.exp(-Math.pow((t % 10) - 4, 2) / 0.5) * 0.25;
    y += tWave;
    
    ecgIndex.current += 1;
    return y;
  }, []);

  const clearAllIntervals = useCallback(() => {
    if (monitoringInterval.current) clearInterval(monitoringInterval.current);
    if (ecgInterval.current) clearInterval(ecgInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
  }, []);

  const stopMonitoring = useCallback(() => {
    clearAllIntervals();
    setStatus('stopped');
    setIsMonitoringComplete(true);

    if (onStopCallbackRef.current) {
      onStopCallbackRef.current();
    }
  }, [clearAllIntervals]);

  const startMonitoring = useCallback(() => {
    setStatus('monitoring');
    setIsMonitoringComplete(false);
    setEcgData([]);
    setTimeRemaining(MONITORING_DURATION);
    ecgIndex.current = 0;

    const initialVitals = generateRandomVitals();
    setCurrentVitals(initialVitals);

    monitoringInterval.current = setInterval(async () => {
      const newVitals = generateRandomVitals();
      setCurrentVitals(newVitals);

      // ✅ ALERT LOGIC
      const alerts = checkForAlerts(newVitals);

      if (alerts.length > 0) {
        setIsAlertActive(true);

        // ✅ BUILD EMAIL LIST
        const emailList = [
          user?.email,
          user?.caretakerEmail,
          ...(familyMembers?.map((m) => m.email) || [])
        ].filter(Boolean);

        for (const alert of alerts) {
          toast.error(alert);

          // 📧 SEND EMAIL
          await fetch("/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: alert,
    emails: emailList,
  }),
});
await fetch("/api/send-whatsapp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: alert,
    phone: user?.phone || "+919XXXXXXXXX", // use your number for now
  }),
});
        }
      }

      const newStatus = getVitalStatus(
        newVitals.heartRate,
        newVitals.respiratoryRate,
        newVitals.spo2
      );
      
      if (newStatus === 'critical' || newStatus === 'warning') {
        const newInsight: AIInsight = {
          id: Date.now().toString(),
          type: newStatus,
          message:
            newStatus === 'critical'
              ? `Critical alert: HR ${newVitals.heartRate}, SpO2 ${newVitals.spo2}`
              : `Warning: HR ${newVitals.heartRate}`,
          timestamp: new Date(),
        };

        setInsights(prev => [newInsight, ...prev.slice(0, 9)]);
      }

    }, 2000);

    ecgInterval.current = setInterval(() => {
      setEcgData(prev => {
        const newData = [...prev, generateECGPoint()];
        return newData.length > 200 ? newData.slice(-200) : newData;
      });
    }, 50);

    let countdown = MONITORING_DURATION;
    timerInterval.current = setInterval(() => {
      countdown -= 1;
      setTimeRemaining(countdown);

      if (countdown <= 0) {
        stopMonitoring();
      }
    }, 1000);

  }, [generateECGPoint, stopMonitoring, user, familyMembers]);

  const dismissAlert = useCallback(() => {
    setIsAlertActive(false);
  }, []);

  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, [clearAllIntervals]);

  useEffect(() => {
    (window as any).__vitalStopCallback = (cb: () => void) => {
      onStopCallbackRef.current = cb;
    };
    return () => {
      delete (window as any).__vitalStopCallback;
    };
  }, []);

  return (
    <VitalContext.Provider
      value={{
        currentVitals,
        status,
        vitalStatus,
        isAlertActive,
        insights,
        startMonitoring,
        stopMonitoring,
        dismissAlert,
        ecgData,
        timeRemaining,
        isMonitoringComplete,
      }}
    >
      {children}
    </VitalContext.Provider>
  );
}

export function useVitals() {
  const context = useContext(VitalContext);
  if (!context) {
    throw new Error('useVitals must be used within a VitalProvider');
  }
  return context;
}