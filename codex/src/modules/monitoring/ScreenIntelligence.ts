"use client";

import { useEffect } from 'react';
import { proctorEvents, PROCTOR_EVENTS } from '../event-engine/ProctorEventBus';

export function useScreenIntelligence() {
  useEffect(() => {
    // 1. Tab Switching Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        proctorEvents.emit(PROCTOR_EVENTS.TAB_SWITCHED);
      }
    };

    // 2. Fullscreen Monitoring
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        proctorEvents.emit(PROCTOR_EVENTS.FULLSCREEN_EXIT);
      }
    };

    // 3. Clipboard Activity (Paste Detection)
    const handlePaste = () => {
      proctorEvents.emit(PROCTOR_EVENTS.CLIPBOARD_PASTE);
    };

    // 4. DevTools Detection (Attempt)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Common DevTools shortcuts
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.key === 'F12')
      ) {
        proctorEvents.emit(PROCTOR_EVENTS.DEVTOOLS_OPENED);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
