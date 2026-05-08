"use client";

import { create } from 'zustand';

interface ProctorState {
  // Feature Flags
  isEnabled: boolean;
  aiProctorActive: boolean;
  
  // Monitoring Stats
  suspicionScore: number;
  violationCount: number;
  warnings: string[];
  
  // Realtime Detection Data
  headPose: { yaw: number; pitch: number; roll: number };
  attentionScore: number;
  personCount: number;
  
  // Actions
  setEnabled: (enabled: boolean) => void;
  updateSuspicion: (delta: number) => void;
  addViolation: (type: string) => void;
  addWarning: (msg: string) => void;
  setHeadPose: (pose: { yaw: number; pitch: number; roll: number }) => void;
  setAttention: (score: number) => void;
  setPersonCount: (count: number) => void;
  reset: () => void;
}

export const useProctorStore = create<ProctorState>((set) => ({
  isEnabled: false, // Default to false, enable only during sessions
  aiProctorActive: false,
  
  suspicionScore: 0,
  violationCount: 0,
  warnings: [],
  
  headPose: { yaw: 0, pitch: 0, roll: 0 },
  attentionScore: 100,
  personCount: 0,

  setEnabled: (enabled) => set({ isEnabled: enabled }),
  updateSuspicion: (delta) => set((state) => ({ 
    suspicionScore: Math.min(100, Math.max(0, state.suspicionScore + delta)) 
  })),
  addViolation: (type) => set((state) => ({ violationCount: state.violationCount + 1 })),
  addWarning: (msg) => set((state) => ({ warnings: [...state.warnings, msg].slice(-5) })),
  setHeadPose: (pose) => set({ headPose: pose }),
  setAttention: (score) => set({ attentionScore: score }),
  setPersonCount: (count) => set({ personCount: count }),
  reset: () => set({
    suspicionScore: 0,
    violationCount: 0,
    warnings: [],
    headPose: { yaw: 0, pitch: 0, roll: 0 },
    attentionScore: 100,
    personCount: 0
  })
}));
