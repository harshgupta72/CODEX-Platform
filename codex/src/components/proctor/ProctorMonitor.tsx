"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AlertTriangle, UserCheck, UserX, Move, Users, EyeOff } from "lucide-react";
import { useFaceAI } from "@/hooks/useFaceAI";
import { useDraggable } from "@/hooks/useDraggable";
import { PROCTOR_CONFIG } from "@/lib/proctorConfig";
import { useAdvancedAIProctor } from "@/modules/proctor/AdvancedAIProctor";

interface ProctorMonitorProps {
  referenceDescriptor: Float32Array;
  onViolation: (count: number, type: string) => void;
  isTerminated: boolean;
  sessionId: string;
  isPaused?: boolean;
}

type MonitorStatus = "active" | "not_detected" | "mismatch" | "multiple" | "camera_error" | "fullscreen_exit";

export function ProctorMonitor({ referenceDescriptor, onViolation, isTerminated, sessionId, isPaused = false }: ProctorMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { position, handleMouseDown, isDragging } = useDraggable({ x: window.innerWidth - 340, y: window.innerHeight - 240 });
  const { getFaceDescriptor, matchFace } = useFaceAI();
  
  const [status, setStatus] = useState<MonitorStatus>("active");
  const consecutiveViolationsRef = useRef(0);
  
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  // Attach Advanced AI Proctor (Phase 1 & 2)
  useAdvancedAIProctor(videoRef);

  // Play warning sound
  const playWarningSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + 0.2);
      setTimeout(() => ctx.close(), 300);
    } catch {}
  }, []);

  // Initialize Camera
  useEffect(() => {
    if (isTerminated) return;

    let mounted = true;
    
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, frameRate: { ideal: 15, max: 30 } } });
        if (mounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          startedAtRef.current = Date.now();
        }
      } catch (err) {
        console.error("Camera access failed during monitoring:", err);
        setStatus("camera_error");
        onViolation(1, "Camera Access Revoked");
      }
    }

    setupCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [isTerminated, onViolation]);

  useEffect(() => {
    if (isTerminated && streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, [isTerminated]);

  // Monitoring Loop
  useEffect(() => {
    if (isTerminated || status === "camera_error") return;

    const interval = setInterval(async () => {
      if (isPaused) return;
      try {
        const nav = sessionStorage.getItem("proctor.navigating");
        if (nav === "1") return;
      } catch {}
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
      if (Date.now() - startedAtRef.current < PROCTOR_CONFIG.GRACE_PERIOD_MS) {
        setStatus("active");
        consecutiveViolationsRef.current = 0;
        return;
      }
      
      try {
        const detection = await getFaceDescriptor(videoRef.current);
        
        let newStatus: MonitorStatus = "active";
        
        // Fullscreen enforcement: if user exits fullscreen during proctoring, count toward warnings
        if (!document.fullscreenElement) {
          newStatus = "fullscreen_exit";
        }
        
        if (newStatus === "active") {
          if (!detection) {
            newStatus = "not_detected";
          } else {
            // Check matching
            const matchResult = matchFace(detection.descriptor, referenceDescriptor);
            if (!matchResult.match && !matchResult.isUncertain) {
              newStatus = "mismatch";
            }
          }
        }
        
        setStatus(newStatus);
        
        // Handle Violations with Debounce
        if (newStatus !== "active") {
          consecutiveViolationsRef.current += 1;
          if (consecutiveViolationsRef.current >= PROCTOR_CONFIG.VIOLATION_DEBOUNCE_FRAMES) {
            // Trigger Violation
            playWarningSound();
            
            let violationType = "Unknown Violation";
            if (newStatus === "not_detected") violationType = PROCTOR_CONFIG.VIOLATION_MESSAGES.NOT_DETECTED;
            if (newStatus === "mismatch") violationType = PROCTOR_CONFIG.VIOLATION_MESSAGES.MISMATCH;
            if (newStatus === "fullscreen_exit") violationType = PROCTOR_CONFIG.VIOLATION_MESSAGES.FULLSCREEN_EXIT;
            
            onViolation(1, violationType);
            consecutiveViolationsRef.current = 0; // Reset debounce counter after triggering
          }
        } else {
          consecutiveViolationsRef.current = 0; // Reset if face is back
        }

      } catch (err) {
        console.error("Proctor loop error:", err);
      }
    }, PROCTOR_CONFIG.DETECTION_INTERVAL);

    return () => clearInterval(interval);
  }, [isTerminated, status, referenceDescriptor, getFaceDescriptor, matchFace, onViolation, playWarningSound, isPaused]);

  if (isTerminated) return null;

  return (
    <div 
      className="fixed z-50 rounded-lg overflow-hidden shadow-2xl bg-black border-2 border-zinc-800 w-[240px]"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header / Drag Handle */}
      <div 
        className="h-8 px-2 flex items-center justify-between cursor-move transition-colors bg-zinc-800"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-xs font-mono text-white">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          MONITORING
        </div>
        <Move size={14} className="text-white/50" />
      </div>

      {/* Video Feed */}
      <div className="relative aspect-[4/3] bg-black group">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform scale-x-[-1] opacity-100"
        />
        
        {/* Overlay Warnings - REMOVED per user request */}
        {/* 
        {status !== "active" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <AlertTriangle className="text-red-500 w-10 h-10 mb-2 drop-shadow-md" />
            <p className="text-red-500 font-bold text-sm bg-black/80 px-2 py-1 rounded">
              {status === "not_detected" && PROCTOR_CONFIG.STATUS_MESSAGES.NOT_DETECTED}
              {status === "mismatch" && PROCTOR_CONFIG.STATUS_MESSAGES.MISMATCH}
              {status === "camera_error" && PROCTOR_CONFIG.STATUS_MESSAGES.CAMERA_BLOCKED}
            </p>
          </div>
        )}
        */}
        
        {/* Session ID Overlay */}
        <div className="absolute bottom-1 right-1 text-[10px] text-white/30 font-mono bg-black/40 px-1 rounded pointer-events-none">
          ID: {sessionId.slice(0, 8)}
        </div>
      </div>
    </div>
  );
}
