import { User, VitalReading, FamilyMember, AIInsight } from './types';

export const mockUser: User = {
  id: '1',
  username: 'john_doe',
  email: 'john.doe@example.com',
  fullName: 'John Doe',
  age: 35,
  bloodGroup: 'O+',
  height: 175,
  weight: 70,
  phone: '9876543210',
  caretakerName: 'Jane Doe',
  caretakerEmail: 'jane.doe@example.com',
  caretakerPhone: '9876543211',
  avatarUrl: undefined,
  createdAt: new Date('2024-01-15'),
};

export const mockVitalHistory: VitalReading[] = [
  {
    id: '1',
    userId: '1',
    heartRate: 72,
    respiratoryRate: 16,
    spo2: 98,
    timestamp: new Date('2024-03-30T10:00:00'),
    status: 'normal',
  },
  {
    id: '2',
    userId: '1',
    heartRate: 85,
    respiratoryRate: 18,
    spo2: 97,
    timestamp: new Date('2024-03-29T14:30:00'),
    status: 'normal',
  },
  {
    id: '3',
    userId: '1',
    heartRate: 105,
    respiratoryRate: 22,
    spo2: 94,
    timestamp: new Date('2024-03-28T09:15:00'),
    status: 'warning',
  },
  {
    id: '4',
    userId: '1',
    heartRate: 68,
    respiratoryRate: 14,
    spo2: 99,
    timestamp: new Date('2024-03-27T16:45:00'),
    status: 'normal',
  },
  {
    id: '5',
    userId: '1',
    heartRate: 78,
    respiratoryRate: 17,
    spo2: 96,
    timestamp: new Date('2024-03-26T11:20:00'),
    status: 'normal',
  },
  {
    id: '6',
    userId: '1',
    heartRate: 115,
    respiratoryRate: 28,
    spo2: 90,
    timestamp: new Date('2024-03-25T08:00:00'),
    status: 'critical',
  },
  {
    id: '7',
    userId: '1',
    heartRate: 70,
    respiratoryRate: 15,
    spo2: 98,
    timestamp: new Date('2024-03-24T13:30:00'),
    status: 'normal',
  },
  {
    id: '8',
    userId: '1',
    heartRate: 92,
    respiratoryRate: 20,
    spo2: 95,
    timestamp: new Date('2024-03-23T10:45:00'),
    status: 'warning',
  },
];

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Jane Doe',
    relation: 'Spouse',
    email: 'jane.doe@example.com',
    phone: '9876543211',
  },
  {
    id: '2',
    name: 'Robert Doe',
    relation: 'Parent',
    email: 'robert.doe@example.com',
    phone: '9876543212',
  },
  {
    id: '3',
    name: 'Emily Doe',
    relation: 'Child',
    email: 'emily.doe@example.com',
    phone: '9876543213',
  },
];

export const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    type: 'normal',
    message: 'Your vital signs are within the normal range. Heart rate is stable at 72 BPM.',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'suggestion',
    message: 'Consider taking a 5-minute break. Your stress indicators have been elevated for the past hour.',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    type: 'normal',
    message: 'SpO2 levels are excellent at 98%. Keep up the good work with your breathing exercises.',
    timestamp: new Date(Date.now() - 7200000),
  },
];

export function generateECGData(length: number = 100): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = i / 10;
    // Simulate ECG waveform with P wave, QRS complex, and T wave
    let y = 0;
    
    // Baseline
    y += Math.sin(t * 0.1) * 0.02;
    
    // P wave (small bump)
    const pWave = Math.exp(-Math.pow((t % 10) - 1, 2) / 0.2) * 0.15;
    y += pWave;
    
    // QRS complex (sharp spike)
    const qrs = (t % 10);
    if (qrs > 2 && qrs < 2.3) {
      y -= 0.1; // Q wave
    } else if (qrs >= 2.3 && qrs < 2.5) {
      y += 1; // R wave (main spike)
    } else if (qrs >= 2.5 && qrs < 2.8) {
      y -= 0.15; // S wave
    }
    
    // T wave (rounded bump)
    const tWave = Math.exp(-Math.pow((t % 10) - 4, 2) / 0.5) * 0.25;
    y += tWave;
    
    data.push(y);
  }
  return data;
}

export function getVitalStatus(
  heartRate: number,
  respiratoryRate: number,
  spo2: number
): 'normal' | 'warning' | 'critical' {
  const isCritical =
    heartRate > 120 ||
    heartRate < 40 ||
    respiratoryRate > 30 ||
    respiratoryRate < 8 ||
    spo2 < 90;

  const isWarning =
    heartRate > 100 ||
    heartRate < 50 ||
    respiratoryRate > 25 ||
    respiratoryRate < 10 ||
    spo2 < 92;

  if (isCritical) return 'critical';
  if (isWarning) return 'warning';
  return 'normal';
}

export function generateRandomVitals(): { heartRate: number; respiratoryRate: number; spo2: number } {
  return {
    heartRate: Math.floor(Math.random() * 40) + 60, // 60-100
    respiratoryRate: Math.floor(Math.random() * 10) + 12, // 12-22
    spo2: Math.floor(Math.random() * 5) + 95, // 95-100
  };
}
