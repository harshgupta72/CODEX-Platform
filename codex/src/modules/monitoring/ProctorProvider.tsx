"use client";

import { useScreenIntelligence } from "@/modules/monitoring/ScreenIntelligence";
import { useSuspicionEngine } from "@/modules/suspicion/SuspicionEngine";
import { useTypingAnalysis } from "@/modules/monitoring/TypingAnalysis";
import { ProctorWidget } from "@/modules/monitoring/ProctorWidget";
import { useProctorStore } from "@/modules/monitoring/ProctorStore";

/**
 * Global Proctoring Provider.
 * Safely wraps the application and provides non-invasive monitoring.
 */
export const ProctorProvider = ({ children }: { children: React.ReactNode }) => {
  const isEnabled = useProctorStore(state => state.isEnabled);

  // Initialize Global Hooks
  useScreenIntelligence();
  useSuspicionEngine();
  useTypingAnalysis();

  return (
    <>
      {children}
      {isEnabled && <ProctorWidget />}
    </>
  );
};
