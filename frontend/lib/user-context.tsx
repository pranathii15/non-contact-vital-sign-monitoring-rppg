'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, FamilyMember } from './types';

const STORAGE_KEY = 'vitalai_user';
const FAMILY_STORAGE_KEY = 'vitalai_family';

interface UserContextType {
  user: User | null;
  familyMembers: FamilyMember[];
  selectedAlertRecipients: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  removeFamilyMember: (id: string) => void;
  toggleAlertRecipient: (id: string) => void;
  setSelectedAlertRecipients: (ids: string[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedAlertRecipients, setSelectedAlertRecipients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        const storedFamily = localStorage.getItem(FAMILY_STORAGE_KEY);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.createdAt = new Date(parsedUser.createdAt);
          setUser(parsedUser);
        }

        if (storedFamily) {
          setFamilyMembers(JSON.parse(storedFamily));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Save user
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  // Save family
  useEffect(() => {
    if (familyMembers.length > 0) {
      localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(familyMembers));
    }
  }, [familyMembers]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const storedUser = localStorage.getItem(STORAGE_KEY);

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.email === email) {
        parsedUser.createdAt = new Date(parsedUser.createdAt);
        setUser(parsedUser);
        return true;
      }
    }

    // ✅ FIXED MOCK USER LOGIC
    let mockUser: User;

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.createdAt = new Date(parsedUser.createdAt);
      mockUser = parsedUser;
    } else {
      mockUser = {
        id: Date.now().toString(),
        username: email.split('@')[0],
        email,
        fullName: email.split('@')[0], // ✅ dynamic instead of "Demo User"
        age: 30,
        bloodGroup: 'A+',
        height: 170,
        weight: 70,
        phone: '',
        caretakerName: '',
        caretakerEmail: '',
        caretakerPhone: '',
        createdAt: new Date(),
      };
    }

    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return true;
  }, []);

  const register = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFamilyMembers([]);
    setSelectedAlertRecipients([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FAMILY_STORAGE_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const addFamilyMember = useCallback((member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString(),
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  }, []);

  const updateFamilyMember = useCallback((id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, ...updates } : member))
    );
  }, []);

  const removeFamilyMember = useCallback((id: string) => {
    setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
    setSelectedAlertRecipients((prev) => prev.filter((recipientId) => recipientId !== id));
  }, []);

  const toggleAlertRecipient = useCallback((id: string) => {
    setSelectedAlertRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        familyMembers,
        selectedAlertRecipients,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        addFamilyMember,
        updateFamilyMember,
        removeFamilyMember,
        toggleAlertRecipient,
        setSelectedAlertRecipients,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}