"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle, AlertCircle, Mic, Maximize, ArrowRight, RefreshCw, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/auth-gate";
import Link from "next/link";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProctorSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Steps: 1 = Permissions, 2 = Capture
  const [step, setStep] = useState(1);
  
  // Permissions State
  const [permCamera, setPermCamera] = useState(false);
  const [permMic, setPermMic] = useState(false);
  const [permFullscreen, setPermFullscreen] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);

  // Capture State
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize stream if permissions granted
  useEffect(() => {
    if (step === 2 && permCamera && permMic) {
      initCamera();
    }
    return () => {
      cleanupStream();
    };
  }, [step, permCamera, permMic]);

  // Check fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setPermFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        (videoRef.current as any).playsInline = true;
        await videoRef.current.play();
      }
    } catch (e: any) {
      toast.error("Failed to access camera/microphone");
    }
  };

  const requestPermissions = async () => {
    setPermError(null);
    try {
      // Request Media Permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermCamera(true);
      setPermMic(true);
      
      // Stop stream immediately, we'll restart it in step 2
      stream.getTracks().forEach(t => t.stop());
      
      toast.success("Camera & Microphone access granted");
    } catch (e: any) {
      console.error(e);
      setPermError("Access denied. Please allow camera and microphone access to proceed.");
      setPermCamera(false);
      setPermMic(false);
    }
  };

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setPermFullscreen(true);
    } catch (e) {
      toast.error("Failed to enter fullscreen");
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    setCapturing(true);
    try {
      const canvas = document.createElement("canvas");
      const w = 320;
      const h = 240;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      // Draw video to canvas
      ctx.drawImage(videoRef.current, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(dataUrl);
    } finally {
      setCapturing(false);
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    // Re-initialize camera on next render cycle
    setTimeout(() => initCamera(), 100);
  };

  const saveAndContinue = async () => {
    if (!capturedImage) return;
    setSaving(true);
    try {
      // Save to Firebase or LocalStorage
      if (hasFirebaseConfig() && user?.userId) {
        try {
          const { db } = getFirebase();
          const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
          await setDoc(doc(db, "proctor_profiles", user.userId), {
            userId: user.userId,
            imageDataUrl: capturedImage,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Firebase save error", err);
          // Fallback
          localStorage.setItem("proctor_profile_image", capturedImage);
        }
      } else {
        localStorage.setItem("proctor_profile_image", capturedImage);
      }
      
      toast.success("Identity verified. Starting editor...");
      router.push("/editor?autoProctor=1");
    } catch (e) {
      toast.error("Failed to save identity");
      setSaving(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {step === 1 ? "Proctoring Setup" : "Identity Verification"}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {step === 1 ? "Grant necessary permissions to continue" : "Capture your face for continuous verification"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-indigo-600" : "bg-gray-300"}`} />
                  <div className={`w-10 h-1 rounded-full ${step >= 2 ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"}`} />
                  <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-indigo-600" : "bg-gray-300"}`} />
                </div>
              </div>
            </div>

            <div className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {/* Camera & Mic */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${(permCamera && permMic) ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"}`}>
                          <Camera size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Camera & Microphone</h3>
                          <p className="text-sm text-gray-500">Required for video and audio monitoring</p>
                        </div>
                      </div>
                      <button
                        onClick={requestPermissions}
                        disabled={permCamera && permMic}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          (permCamera && permMic)
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {(permCamera && permMic) ? "Granted" : "Allow Access"}
                      </button>
                    </div>

                    {/* Fullscreen */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${permFullscreen ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"}`}>
                          <Maximize size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Fullscreen Mode</h3>
                          <p className="text-sm text-gray-500">Required to prevent tab switching</p>
                        </div>
                      </div>
                      <button
                        onClick={requestFullscreen}
                        disabled={permFullscreen}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          permFullscreen
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {permFullscreen ? "Active" : "Enable"}
                      </button>
                    </div>
                  </div>

                  {permError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <AlertCircle size={20} />
                      <span className="text-sm font-medium">{permError}</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!permCamera || !permMic || !permFullscreen}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Proceed to Identity Verification
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] shadow-inner">
                    {!capturedImage ? (
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                        muted 
                        playsInline 
                      />
                    ) : (
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                      />
                    )}
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Camera
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Ensure your face is clearly visible and centered.
                    </p>
                    <div className="flex gap-3">
                      {!capturedImage ? (
                        <button
                          onClick={captureImage}
                          disabled={capturing}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          <Camera size={20} />
                          Capture Photo
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={retakeImage}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold transition-colors"
                          >
                            <RefreshCw size={20} />
                            Re-take
                          </button>
                          <button
                            onClick={saveAndContinue}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70"
                          >
                            {saving ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Save size={20} />
                            )}
                            Save & Continue
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </RequireAuth>
  );
}

