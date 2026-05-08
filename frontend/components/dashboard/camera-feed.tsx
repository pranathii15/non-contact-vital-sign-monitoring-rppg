// 'use client';

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Camera, Play, AlertCircle, VideoOff, CheckCircle2 } from 'lucide-react';
// import { GlassCard } from '@/components/ui/glass-card';
// import { GlowButton } from '@/components/ui/glow-button';
// import { useVitals } from '@/lib/vital-context';
// import { cn } from '@/lib/utils';
// import { toast } from 'sonner';

// export function CameraFeed() {
//   const { status, startMonitoring, timeRemaining, isMonitoringComplete } = useVitals();
//   const [isCameraOn, setIsCameraOn] = useState(false);
//   const [cameraError, setCameraError] = useState<string | null>(null);
//   const [isInitializing, setIsInitializing] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   const stopCamera = useCallback(() => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//     setIsCameraOn(false);
//   }, []);

//   const handleStartMonitoring = useCallback(async () => {
//     if (isInitializing || status === 'monitoring') return;

//     setIsInitializing(true);
//     setCameraError(null);

//     try {
//       // ✅ stop previous stream before starting new
//       stopCamera();

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: 'user',
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//         },
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         streamRef.current = stream;
//         setIsCameraOn(true);

//         startMonitoring();

//         toast.success('Monitoring started', {
//           description: 'AI is analyzing your vital signs for 15 seconds',
//         });
//       }
//     } catch {
//       setCameraError('Unable to access camera. Please allow camera permissions.');
//       setIsCameraOn(false);
//       toast.error('Camera access denied');
//     } finally {
//       setIsInitializing(false);
//     }
//   }, [isInitializing, status, startMonitoring, stopCamera]);

//   // ✅ FIX: stop camera after 15 seconds
//   useEffect(() => {
//     if (status === 'monitoring') {
//       const timer = setTimeout(() => {
//         stopCamera();
//         toast.info('Monitoring complete', {
//           description: 'Vital signs have been captured and frozen',
//         });
//       }, 15000);

//       return () => clearTimeout(timer);
//     }
//   }, [status]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       stopCamera();
//     };
//   }, [stopCamera]);

//   const getStatusDisplay = () => {
//     if (status === 'monitoring') {
//       return { text: `Monitoring... ${timeRemaining}s`, color: 'bg-success animate-pulse' };
//     }
//     if (isMonitoringComplete) {
//       return { text: 'Monitoring Complete', color: 'bg-primary' };
//     }
//     if (isCameraOn) {
//       return { text: 'Camera Ready', color: 'bg-primary' };
//     }
//     return { text: 'Camera Off', color: 'bg-muted' };
//   };

//   const statusDisplay = getStatusDisplay();

//   return (
//     <GlassCard className="p-6">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
//             <Camera className="w-5 h-5 text-primary" />
//           </div>
//           <div>
//             <h3 className="font-semibold text-foreground">Live Camera Feed</h3>
//             <p className="text-sm text-muted-foreground">Position your face in the frame</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className={cn('w-2 h-2 rounded-full', statusDisplay.color)} />
//           <span className="text-sm text-muted-foreground">{statusDisplay.text}</span>
//         </div>
//       </div>

//       <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/30 mb-4">
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className={cn(
//             'w-full h-full object-cover transition-opacity duration-300',
//             isCameraOn ? 'opacity-100' : 'opacity-0'
//           )}
//         />

//         <AnimatePresence>
//           {!isCameraOn && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="absolute inset-0 flex flex-col items-center justify-center"
//             >
//               {cameraError ? (
//                 <div className="text-center p-4">
//                   <AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
//                   <p className="text-sm text-muted-foreground">{cameraError}</p>
//                 </div>
//               ) : isMonitoringComplete ? (
//                 <div className="text-center">
//                   <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
//                   <p className="text-sm text-muted-foreground">Monitoring complete</p>
//                   <p className="text-xs text-muted-foreground mt-1">Values have been captured</p>
//                 </div>
//               ) : (
//                 <div className="text-center">
//                   <VideoOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
//                   <p className="text-sm text-muted-foreground">Camera Off</p>
//                   <p className="text-xs text-muted-foreground mt-1">Click Start Monitoring to begin</p>
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {status === 'monitoring' && (
//           <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass-button">
//             <span className="w-2 h-2 rounded-full bg-critical animate-pulse" />
//             <span className="text-xs font-medium text-foreground">REC</span>
//           </div>
//         )}
//       </div>

//       <div className="flex flex-col sm:flex-row gap-3">
//         <GlowButton
//           variant="primary"
//           size="md"
//           className="flex-1"
//           onClick={handleStartMonitoring}
//           disabled={status === 'monitoring'}
//           loading={isInitializing}
//           icon={<Play className="w-5 h-5" />}
//         >
//           {status === 'monitoring'
//             ? `Monitoring... ${timeRemaining}s`
//             : isMonitoringComplete
//             ? 'Start Again'
//             : 'Start Monitoring'}
//         </GlowButton>
//       </div>

//       <div className="mt-4 p-3 rounded-xl bg-glass/50">
//         <p className="text-xs text-muted-foreground leading-relaxed">
//           <strong className="text-foreground">Instructions:</strong> Click Start Monitoring to begin.
//           The system will automatically run for 15 seconds, capturing your vital signs.
//           Ensure good lighting and sit still during monitoring.
//         </p>
//       </div>
//     </GlassCard>
//   );
// }
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Play, AlertCircle, VideoOff, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { useVitals } from '@/lib/vital-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CameraFeed() {
  const { status, startMonitoring, timeRemaining, isMonitoringComplete } = useVitals();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // ✅ NEW

  const stopCamera = useCallback(() => {
    // 🔴 CLEAR TIMER FIRST (IMPORTANT)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  }, []);

  const handleStartMonitoring = useCallback(async () => {
    if (isInitializing || status === 'monitoring') return;

    setIsInitializing(true);
    setCameraError(null);

    try {
      // ✅ ALWAYS STOP PREVIOUS CAMERA
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
      setIsCameraOn(true);

      startMonitoring();

      // ✅ START 15s TIMER HERE (STRONG FIX)
      timerRef.current = setTimeout(() => {
        stopCamera();

        toast.info('Monitoring complete', {
          description: 'Vital signs have been captured and frozen',
        });
      }, 15000);

      toast.success('Monitoring started', {
        description: 'AI is analyzing your vital signs for 15 seconds',
      });
    } catch {
      setCameraError('Unable to access camera. Please allow camera permissions.');
      setIsCameraOn(false);
      toast.error('Camera access denied');
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, status, startMonitoring, stopCamera]);

  // ✅ REMOVE dependency issues (SAFE CLEANUP ONLY)
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getStatusDisplay = () => {
    if (status === 'monitoring') {
      return { text: `Monitoring... ${timeRemaining}s`, color: 'bg-success animate-pulse' };
    }
    if (isMonitoringComplete) {
      return { text: 'Monitoring Complete', color: 'bg-primary' };
    }
    if (isCameraOn) {
      return { text: 'Camera Ready', color: 'bg-primary' };
    }
    return { text: 'Camera Off', color: 'bg-muted' };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Live Camera Feed</h3>
            <p className="text-sm text-muted-foreground">Position your face in the frame</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', statusDisplay.color)} />
          <span className="text-sm text-muted-foreground">{statusDisplay.text}</span>
        </div>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/30 mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isCameraOn ? 'opacity-100' : 'opacity-0'
          )}
        />

        <AnimatePresence>
          {!isCameraOn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {cameraError ? (
                <div className="text-center p-4">
                  <AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{cameraError}</p>
                </div>
              ) : isMonitoringComplete ? (
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Monitoring complete</p>
                  <p className="text-xs text-muted-foreground mt-1">Values have been captured</p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Camera Off</p>
                  <p className="text-xs text-muted-foreground mt-1">Click Start Monitoring to begin</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'monitoring' && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass-button">
            <span className="w-2 h-2 rounded-full bg-critical animate-pulse" />
            <span className="text-xs font-medium text-foreground">REC</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <GlowButton
          variant="primary"
          size="md"
          className="flex-1"
          onClick={handleStartMonitoring}
          disabled={status === 'monitoring'}
          loading={isInitializing}
          icon={<Play className="w-5 h-5" />}
        >
          {status === 'monitoring'
            ? `Monitoring... ${timeRemaining}s`
            : isMonitoringComplete
            ? 'Start Again'
            : 'Start Monitoring'}
        </GlowButton>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-glass/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Instructions:</strong> Click Start Monitoring to begin.
          The system will automatically run for 15 seconds, capturing your vital signs.
          Ensure good lighting and sit still during monitoring.
        </p>
      </div>
    </GlassCard>
  );
}