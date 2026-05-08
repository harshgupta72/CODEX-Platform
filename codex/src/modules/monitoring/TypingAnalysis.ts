"use client";

import { useEffect, useRef } from 'react';
import { proctorEvents, PROCTOR_EVENTS } from '../event-engine/ProctorEventBus';
import { useProctorStore } from '../monitoring/ProctorStore';

export function useTypingAnalysis() {
  const isEnabled = useProctorStore(state => state.isEnabled);
  const updateSuspicion = useProctorStore(state => state.updateSuspicion);
  
  const lastKeyTimeRef = useRef<number>(Date.now());
  const keystrokesRef = useRef<number[]>([]);
  const pasteCountRef = useRef(0);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;
      
      keystrokesRef.current.push(interval);
      if (keystrokesRef.current.length > 50) keystrokesRef.current.shift();

      // Detect suspicious instant bursts (too fast for human typing)
      if (keystrokesRef.current.length > 10) {
        const avg = keystrokesRef.current.reduce((a, b) => a + b, 0) / keystrokesRef.current.length;
        if (avg < 20) { // Less than 20ms between keys is highly suspicious
          updateSuspicion(0.5);
        }
      }

      lastKeyTimeRef.current = now;
    };

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text') || '';
      if (text.length > 200) { // Large paste
        updateSuspicion(30);
        proctorEvents.emit(PROCTOR_EVENTS.WARNING_SHOWN, {
          level: 'high',
          message: 'Large code paste detected. This is being monitored.'
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [isEnabled, updateSuspicion]);

  return null;
}
