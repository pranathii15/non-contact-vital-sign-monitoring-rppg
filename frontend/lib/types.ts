export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  age: number;
  bloodGroup: string;
  height: number;
  weight: number;
  phone: string;
  caretakerName: string;
  caretakerEmail: string;
  caretakerPhone: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface VitalReading {
  id: string;
  userId: string;
  heartRate: number;
  respiratoryRate: number;
  spo2: number;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface AlertThresholds {
  heartRate: { min: number; max: number };
  respiratoryRate: { min: number; max: number };
  spo2: { min: number };
}

export interface AIInsight {
  id: string;
  type: 'normal' | 'warning' | 'critical' | 'suggestion';
  message: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type MonitoringStatus = 'idle' | 'monitoring' | 'stopped';

export const ALERT_THRESHOLDS: AlertThresholds = {
  heartRate: { min: 50, max: 100 },
  respiratoryRate: { min: 10, max: 25 },
  spo2: { min: 92 },
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const RELATIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'] as const;
