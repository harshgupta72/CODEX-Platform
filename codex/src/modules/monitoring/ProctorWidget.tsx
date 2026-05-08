"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, ShieldAlert, X } from 'lucide-react';
import { useProctorStore } from '@/modules/monitoring/ProctorStore';
import { proctorEvents, PROCTOR_EVENTS } from '@/modules/event-engine/ProctorEventBus';
import { usePathname } from 'next/navigation';

export const ProctorWidget = () => {
  const pathname = usePathname();
  const isEnabled = useProctorStore(state => state.isEnabled);
  const suspicionScore = useProctorStore(state => state.suspicionScore);
  const personCount = useProctorStore(state => state.personCount);
  const [lastEvent, setLastEvent] = useState<string>("Monitoring active");
  const [warnings, setWarnings] = useState<{id: number, msg: string, level: 'medium' | 'high'}[]>([]);

  // Only show the widget on problem detail pages or the editor
  const isQuestionPage = pathname?.startsWith('/problems/') || pathname === '/editor';

  useEffect(() => {
    if (!isEnabled || !isQuestionPage) return;

    const handleWarning = (data: {level: 'medium' | 'high', message: string}) => {
      const id = Date.now();
      setWarnings(prev => [...prev, { id, msg: data.message, level: data.level }].slice(-3));
      setTimeout(() => {
        setWarnings(prev => prev.filter(w => w.id !== id));
      }, 5000);
    };

    const handleFaceLost = () => setLastEvent("Face not detected");
    const handleFaceDetected = () => setLastEvent("Monitoring active");
    const handleMultiFace = () => setLastEvent("Multiple people detected!");

    proctorEvents.on(PROCTOR_EVENTS.WARNING_SHOWN, handleWarning);
    proctorEvents.on(PROCTOR_EVENTS.FACE_LOST, handleFaceLost);
    proctorEvents.on(PROCTOR_EVENTS.FACE_DETECTED, handleFaceDetected);
    proctorEvents.on(PROCTOR_EVENTS.MULTIPLE_FACES, handleMultiFace);

    return () => {
      proctorEvents.off(PROCTOR_EVENTS.WARNING_SHOWN, handleWarning);
      proctorEvents.off(PROCTOR_EVENTS.FACE_LOST, handleFaceLost);
      proctorEvents.off(PROCTOR_EVENTS.FACE_DETECTED, handleFaceDetected);
      proctorEvents.off(PROCTOR_EVENTS.MULTIPLE_FACES, handleMultiFace);
    };
  }, [isEnabled, isQuestionPage]);

  if (!isEnabled || !isQuestionPage) return null;

  return (
    <>
      {/* Floating Widget */}
      <motion.div 
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        initial={{ x: 20, y: 20 }}
        className="fixed bottom-6 right-6 z-50 w-64 bg-black/80 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 shadow-2xl shadow-indigo-500/10 cursor-move"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${suspicionScore > 60 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">AI Proctoring</span>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            suspicionScore < 30 ? 'bg-emerald-500/20 text-emerald-400' :
            suspicionScore < 60 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {suspicionScore < 30 ? 'SECURE' : suspicionScore < 60 ? 'SUSPICIOUS' : 'HIGH RISK'}
          </div>
        </div>

        <div className="space-y-3">
          {/* Suspicion Meter */}
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-500">Suspicion Level</span>
              <span className="text-gray-300 font-mono">{Math.round(suspicionScore)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${suspicionScore}%` }}
                className={`h-full ${
                  suspicionScore < 30 ? 'bg-emerald-500' :
                  suspicionScore < 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">Person(s)</span>
            <span className={`font-bold ${personCount > 1 ? 'text-red-400' : 'text-gray-300'}`}>{personCount}</span>
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] text-gray-500 italic truncate">{lastEvent}</p>
          </div>
        </div>
      </motion.div>

      {/* Warning Overlays */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-md pointer-events-none">
        <AnimatePresence>
          {warnings.map(warning => (
            <motion.div
              key={warning.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xl pointer-events-auto ${
                warning.level === 'high' 
                ? 'bg-red-950/80 border-red-500/50 text-red-200' 
                : 'bg-yellow-950/80 border-yellow-500/50 text-yellow-200'
              }`}
            >
              <ShieldAlert className={`w-5 h-5 shrink-0 ${warning.level === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
              <div className="flex-1">
                <p className="text-xs font-bold mb-0.5">{warning.level === 'high' ? 'CRITICAL WARNING' : 'CAUTION'}</p>
                <p className="text-[11px] opacity-80">{warning.msg}</p>
              </div>
              <button 
                onClick={() => setWarnings(prev => prev.filter(w => w.id !== warning.id))}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Screen Edge Glow for High Suspicion */}
      <AnimatePresence>
        {suspicionScore > 60 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[40] border-[8px] border-red-500/20 shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]"
          />
        )}
      </AnimatePresence>
    </>
  );
};
