"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle, Shield, Loader2, AlertTriangle } from "lucide-react";
import { useFaceAI } from "@/hooks/useFaceAI";
import { PROCTOR_CONFIG } from "@/lib/proctorConfig";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';

interface ProctorSetupModalProps {
  onComplete: (descriptor: Float32Array, sessionId: string) => void;
}

export function ProctorSetupModal({ onComplete }: ProctorSetupModalProps) {
  // Start directly in "camera" step for instant activation
  const [step, setStep] = useState<"terms" | "camera" | "capture">("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedDescriptor, setCapturedDescriptor] = useState<Float32Array | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(true); // Auto-accept terms since user is already in editor
  
  const { modelsLoaded, getFaceDescriptor, modelError, ensureRecognitionLoaded } = useFaceAI();

  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  useEffect(() => {
    // Cleanup on unmount only
    return () => {
      stopCamera();
    };
  }, []); // Run once on mount

  // Attach stream to video element whenever it becomes available
  useEffect(() => {
    if (stream && videoRef.current && isCameraEnabled) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Auto-play failed:", e));
    }
  }, [stream, isCameraEnabled]);

  // Ensure video plays when metadata is loaded
  const handleVideoLoad = () => {
    if (videoRef.current) {
        videoRef.current.play().catch(e => console.error("Auto-play failed:", e));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraEnabled(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false 
      });
      // Set stream first
      setStream(mediaStream);
      // Then enable UI which mounts video
      setIsCameraEnabled(true);
      // Warm up recognition model while camera initializes
      void ensureRecognitionLoaded();
      setStep("camera");
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fsErr) {
        // Ignore failure; fullscreen may require explicit user gesture
      }
      // videoRef.current.srcObject assignment is now handled by useEffect
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera/Microphone access denied. Please enable permissions.");
      setIsCameraEnabled(false);
    }
  };

  const toggleCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const shouldEnable = e.target.checked;
    if (shouldEnable) {
      await startCamera();
    } else {
      stopCamera();
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !modelsLoaded) return;
    
    setIsCapturing(true);
    try {
      const detection = await getFaceDescriptor(videoRef.current);
      if (detection) {
        setCapturedDescriptor(detection.descriptor);
        setStep("capture");
        toast.success("Face captured successfully!");
      } else {
        toast.error("No face detected. Please adjust lighting and position.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to capture face.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedDescriptor(null);
    setStep("camera");
  };

  const handleConfirm = () => {
    if (capturedDescriptor) {
      const sessionId = uuidv4();
      onComplete(capturedDescriptor, sessionId);
    }
  };

  if (!modelsLoaded && !modelError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="flex flex-col items-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>{PROCTOR_CONFIG.STATUS_MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Proctor Mode Setup</h2>
        </div>

        {step === "terms" && (
          <div className="space-y-6">
            <div className="bg-zinc-800/50 p-4 rounded-lg text-sm text-zinc-300 space-y-2">
              <p>To ensure academic integrity, this session requires camera monitoring.</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Your face must be visible at all times.</li>
                <li>Looking away frequently may trigger warnings.</li>
                <li>Multiple faces will trigger a violation.</li>
                <li>5 warnings will automatically terminate the session.</li>
              </ul>
            </div>
            
            <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition-colors">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="text-sm text-zinc-300">I agree to enable camera monitoring</span>
            </label>

            <button
              onClick={startCamera}
              disabled={!termsAccepted}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Activate Proctor Mode
            </button>
          </div>
        )}

        {step === "camera" && (
          <div className="space-y-6">
            {/* Camera Enable Checkbox */}
            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isCameraEnabled}
                        onChange={toggleCamera}
                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Enable Camera & Microphone</span>
                        <span className="text-xs text-zinc-400">Required for proctoring session</span>
                    </div>
                </label>
            </div>

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-zinc-700">
              {isCameraEnabled ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    onLoadedMetadata={handleVideoLoad}
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
              ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-500 flex-col gap-2">
                      <Camera className="w-12 h-12 opacity-50" />
                      <p className="text-sm">Camera is off</p>
                  </div>
              )}
              <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-lg pointer-events-none"></div>
            </div>
            <p className="text-center text-sm text-zinc-400">
              Position your face in the frame and ensure good lighting.
            </p>
            <button
              onClick={handleCapture}
              disabled={isCapturing || !isCameraEnabled}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isCapturing ? "Capturing..." : "Capture Photo"}
            </button>
          </div>
        )}

        {step === "capture" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8 text-green-500">
              <CheckCircle className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Face Registered Successfully</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleRetake}
                className="py-2 px-4 border border-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
