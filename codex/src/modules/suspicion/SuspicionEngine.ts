"use client";

import { useEffect, useRef } from 'react';
import { proctorEvents, PROCTOR_EVENTS } from '../event-engine/ProctorEventBus';
import { useProctorStore } from '../monitoring/ProctorStore';

export function useSuspicionEngine() {
  const updateSuspicion = useProctorStore(state => state.updateSuspicion);
  const suspicionScore = useProctorStore(state => state.suspicionScore);
  const decayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1.中央集権的なイベント監視 (Centralized Event Monitoring)
    const handlers = {
      [PROCTOR_EVENTS.TAB_SWITCHED]: () => updateSuspicion(15),
      [PROCTOR_EVENTS.FULLSCREEN_EXIT]: () => updateSuspicion(20),
      [PROCTOR_EVENTS.CLIPBOARD_PASTE]: () => updateSuspicion(5),
      [PROCTOR_EVENTS.MULTIPLE_FACES]: () => updateSuspicion(40),
      [PROCTOR_EVENTS.FACE_LOST]: () => updateSuspicion(10),
      [PROCTOR_EVENTS.ATTENTION_LOST]: () => updateSuspicion(5),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      proctorEvents.on(event, handler);
    });

    // 2. Suspicion Decay System (Scores slowly decrease over time if no new violations)
    decayIntervalRef.current = setInterval(() => {
      updateSuspicion(-1); // Decay 1 point every 10 seconds
    }, 10000);

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        proctorEvents.off(event, handler);
      });
      if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);
    };
  }, [updateSuspicion]);

  // 3. Trigger Violations based on score thresholds
  useEffect(() => {
    if (suspicionScore >= 60) {
      proctorEvents.emit(PROCTOR_EVENTS.WARNING_SHOWN, {
        level: 'high',
        message: 'High suspicion activity detected. Please stay focused.'
      });
    } else if (suspicionScore >= 30) {
      proctorEvents.emit(PROCTOR_EVENTS.WARNING_SHOWN, {
        level: 'medium',
        message: 'Suspicious behavior noticed.'
      });
    }
  }, [suspicionScore]);

  return null;
}
