"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Camera, StopCircle, Mic, AlertTriangle, Minimize2, Maximize2, Move } from "lucide-react";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { motion, useDragControls } from "framer-motion";
import toast from "react-hot-toast";
import Script from "next/script";

type Props = {
  userId: string | null;
  problemId: string | null;
  className?: string;
  autoStart?: boolean;
  onVerificationChange?: (verified: boolean) => void;
  onViolation?: (type: string, message: string) => void;
  onActiveChange?: (active: boolean) => void;
  onEditorBlur?: (blurred: boolean) => void;
  onSessionEnd?: () => void;
};

type ViolationType = 'no_face' | 'multiple_faces' | 'face_mismatch' | 'tab_switch' | 'fullscreen_exit';
type ProctorStep = 'permission' | 'capture' | 'active' | 'violation' | 'fullscreen_warning';

import { PROCTOR_CONFIG } from "@/lib/proctorConfig";
import { ViolationModal } from "./proctor/ViolationModal";

export function ProctorMode({ userId, problemId, className, autoStart = false, onVerificationChange, onViolation, onActiveChange, onEditorBlur, onSessionEnd }: Props) {
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Audio Analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Face Recognition State
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [savedUserEmbedding, setSavedUserEmbedding] = useState<Float32Array | null>(null);
  const [verified, setVerified] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Proctor Flow State
  const [currentStep, setCurrentStep] = useState<ProctorStep>('capture');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [currentViolation, setCurrentViolation] = useState<{type: string, message: string} | null>(null);
  const [violationPopupCount, setViolationPopupCount] = useState(0);
  
  // Violation Logic
  const [warnings, setWarnings] = useState<string[]>([]);
  const [violationCount, setViolationCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  
  // UI State
  const [minimized, setMinimized] = useState(false);
  const dragControls = useDragControls();

  // Load face-api.js models (from local /public/models for reliability & speed)
  async function loadModels() {
    if (!scriptLoaded) return;
    
    try {
      const faceapi = (window as any).faceapi;
      
      if (!faceapi) {
        throw new Error('face-api.js not loaded');
      }
      
      console.log('Loading face recognition models from local /models...');

      // All model files are served from Next.js public folder: /public/models/*
      const MODEL_URL = '/models';

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      
      setModelsLoaded(true);
      console.log('Face-api.js models loaded successfully from local assets.');
    } catch (error) {
      console.error('Failed to load face-api.js models:', error);
      toast.error('Failed to load face recognition models. Please refresh the page.');
      throw error;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, []);

  // Preload models as soon as the face-api script is ready to reduce waiting time
  useEffect(() => {
    if (scriptLoaded && !modelsLoaded) {
      loadModels().catch((err) => {
        console.error('Background model preload failed:', err);
      });
    }
  }, [scriptLoaded, modelsLoaded]);

  // Get saved user embedding from Firebase or localStorage
  async function getSavedUserEmbedding(): Promise<Float32Array | null> {
    try {
      if (hasFirebaseConfig() && userId) {
        const { db } = getFirebase();
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "proctor_profiles", userId));
        const embeddingData = snap.exists() ? (snap.data() as any)?.faceEmbedding : null;
        if (embeddingData) {
          return new Float32Array(embeddingData);
        }
      } else {
        const embeddingData = localStorage.getItem("proctor_face_embedding");
        if (embeddingData) {
          return new Float32Array(JSON.parse(embeddingData));
        }
      }
    } catch (error) {
      console.error('Failed to get saved embedding:', error);
    }
    return null;
  }

  // Save user embedding to Firebase or localStorage
  async function saveUserEmbedding(embedding: Float32Array) {
    try {
      if (hasFirebaseConfig() && userId) {
        const { db } = getFirebase();
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "proctor_profiles", userId), {
          faceEmbedding: Array.from(embedding),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        localStorage.setItem("proctor_face_embedding", JSON.stringify(Array.from(embedding)));
      }
    } catch (error) {
      console.error('Failed to save embedding:', error);
    }
  }

  // Calculate cosine similarity between two embeddings
  function cosineSimilarity(embedding1: Float32Array, embedding2: Float32Array): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (norm1 * norm2);
  }

  // Add violation with specific type
  function addViolation(type: ViolationType, message: string) {
    setViolationCount(c => c + 1);
    if (type === 'tab_switch') setTabSwitchCount(c => c + 1);
    setWarnings(prev => [...prev.slice(-4), `${type}: ${message}`]);
    
    // Show violation popup
    setCurrentViolation({ type, message });
    const newCount = violationPopupCount + 1;
    setViolationPopupCount(newCount);
    
    // Blur editor during violation
    if (onEditorBlur) onEditorBlur(true);
    
    // Check if violation count reached max warnings
    if (newCount >= PROCTOR_CONFIG.MAX_WARNINGS) {
      // Terminate session and redirect to dashboard
      handleSessionTermination();
    }
    
    // Visual Feedback (Toast only if not showing popup, or keep it?)
    // User requested "no need to shown these error here" for termination.
    // For intermediate warnings, user wants popup.
    /* 
    if (newCount < PROCTOR_CONFIG.MAX_WARNINGS) {
       toast.error("Violation Detected! Please check the warning popup.");
    }
    */

    if (onViolation) onViolation(type, message);
  }
  
  // Handle continuing after violation
  function handleViolationContinue() {
    setCurrentViolation(null);
    if (onEditorBlur) onEditorBlur(false);
  }
  
  // Handle session termination
  function handleSessionTermination() {
    // User requested: "no need to shown these error here", direct redirect.
    // toast.error('Session terminated due to multiple violations'); 
    endProctor();
    
    // Redirect to dashboard immediately
    window.location.href = '/dashboard'; 
    
    if (onSessionEnd) onSessionEnd();
  }
  
  // Continue after violation popup
  function handleContinueViolation() {
    setCurrentViolation(null);
    if (onEditorBlur) onEditorBlur(false);
  }
  
  // Setup camera for face capture only
  async function setupCameraForCapture() {
    try {
      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API not supported in this browser');
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Available video devices:', videoDevices.length);
      
      if (videoDevices.length === 0) {
        throw new Error('No camera detected. Please connect a camera and refresh.');
      }
      
      // Request camera only for capture
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          aspectRatio: 16/9
        }
      });
      
      console.log('Capture stream obtained:', stream.getVideoTracks().length, 'video tracks');
      
      // Setup video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        (videoRef.current as any).playsInline = true;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error('Video play error:', e));
        };
        
        try {
          await videoRef.current.play();
          console.log('Capture video playing successfully');
        } catch (error) {
          console.error('Failed to play capture video:', error);
          throw new Error('Failed to start camera preview');
        }
      }
      
      // Wait for video to stabilize (reduced from 2000ms to 300ms for faster loading)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Camera capture setup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to setup camera: ${errorMessage}`);
      
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      return false;
    }
  }
  // Capture face only (no monitoring)
  async function captureFace() {
    if (!scriptLoaded || !videoRef.current) {
      toast.error('Camera not ready');
      return false;
    }
    
    // Setup camera if not already done
    if (!streamRef.current) {
      toast.loading('Setting up camera...');
      const cameraSetup = await setupCameraForCapture();
      toast.dismiss();
      
      if (!cameraSetup) {
        return false;
      }
    }
    
    // Check if video is ready
    if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
      toast.error('Camera not ready yet');
      return false;
    }
    
    try {
      const faceapi = (window as any).faceapi;
      if (!faceapi) {
        toast.error('Face recognition not loaded');
        return false;
      }
      
      // Load models if not loaded
      if (!modelsLoaded) {
        toast.loading('Loading face recognition models...');
        try {
          await loadModels();
          toast.dismiss();
        } catch (error) {
          toast.dismiss();
          toast.error('Failed to load face models');
          return false;
        }
      }
      
      toast.loading('Detecting face...');
      
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      toast.dismiss();
      console.log('Face detection result:', detections.length, 'faces detected');
      
      if (detections.length === 1) {
        const embedding = detections[0].descriptor;
        setSavedUserEmbedding(embedding);
        await saveUserEmbedding(embedding);
        setFaceCaptured(true);
        
        // Capture the current frame as an image to display
        if (videoRef.current) {
          videoRef.current.pause();
        }
        
        // Stop the camera stream immediately to save resources
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        toast.success('Face captured successfully!');
        return true;
      } else if (detections.length === 0) {
        toast.error('No face detected');
      } else {
        toast.error('Multiple faces detected');
      }
      return false;
    } catch (error) {
      console.error('Face capture failed:', error);
      toast.error('Face capture failed');
      return false;
    }
  }
  
  // Request permissions and setup camera for monitoring
  async function requestPermissions() {
    try {
      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API not supported in this browser');
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Available video devices:', videoDevices.length);
      
      if (videoDevices.length === 0) {
        throw new Error('No camera detected. Please connect a camera and refresh.');
      }
      
      // Request camera and microphone with better constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          aspectRatio: 16/9
        }, 
        audio: true 
      });
      
      console.log('Media stream obtained:', stream.getVideoTracks().length, 'video tracks');
      
      // Setup video stream for monitoring first
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        (videoRef.current as any).playsInline = true;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error('Video play error:', e));
        };
        
        try {
          await videoRef.current.play();
        } catch (error) {
          console.error('Failed to play video:', error);
          throw new Error('Failed to start camera preview');
        }
      }
      
      // Request fullscreen (non-blocking)
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fsError) {
        console.warn('Fullscreen request failed, continuing without it:', fsError);
        toast.error('Fullscreen permission denied. Please enable manually for better security.');
      }
      
      setPermissionsGranted(true);
      // Start monitoring after permissions are granted
      await startMonitoring();
      
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to get permissions: ${errorMessage}`);
      
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      return false;
    }
  }
  // Re-take face capture
  async function retakeFace() {
    setFaceCaptured(false);
    setSavedUserEmbedding(null);
    
    // Stop current stream first to ensure clean state
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    toast.dismiss();
    toast.success('Camera reset - you can capture again');
    
    // Restart camera immediately
    setupCameraForCapture().catch(err => {
      console.error('Failed to restart camera:', err);
      toast.error('Failed to restart camera');
    });
  }
  // Save face and request permissions
  async function saveAndProceed() {
    if (!faceCaptured) {
      toast.error('Please capture face first');
      return;
    }
    
    // Close camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Now request permissions for monitoring
    setCurrentStep('permission');
  }
  
  // Save and proceed to active mode (after permissions)
  async function startMonitoring() {
    if (!permissionsGranted || !faceCaptured) return;
    
    try {
      // Create session
      const res = await axios.post("/api/proctor/session", {
        action: "start",
        userId,
        problemId,
      });
      setSessionId(res.data.sessionId || null);
      startTimeRef.current = Date.now();
      
      // Setup audio monitoring
      if (streamRef.current) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(streamRef.current);
        source.connect(analyser);
        analyser.fftSize = 256;
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        
        // Start monitoring
        requestAnimationFrame(monitorLoop);
      }
      
      // Start continuous face detection
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      detectionIntervalRef.current = setInterval(() => {
        detectFaces();
      }, 2000); // Check every 2 seconds
      
      setActive(true);
      if (onActiveChange) onActiveChange(true);
      setCurrentStep('active');
    } catch (error) {
      console.error('Failed to start proctoring session:', error);
      toast.error('Failed to start proctoring session');
    }
  }

  // Face detection and recognition loop
  async function detectFaces() {
    if (!videoRef.current || !modelsLoaded || !savedUserEmbedding) return;

    try {
      const faceapi = (window as any).faceapi;
      if (!faceapi) return;
      
      const detections = await (window as any).faceapi
        .detectAllFaces(videoRef.current, new (window as any).faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      // No face detected
      if (detections.length === 0) {
        setVerified(false);
        addViolation('no_face', 'No face detected in camera view');
        return;
      }

      // Multiple faces detected
      if (detections.length > 1) {
        setVerified(false);
        addViolation('multiple_faces', `${detections.length} faces detected - only one person allowed`);
        return;
      }

      // Single face detected - check if it matches saved embedding
      const currentEmbedding = detections[0].descriptor;
      
      // Use Euclidean distance for better accuracy (lower is better)
      const distance = faceapi.euclideanDistance(currentEmbedding, savedUserEmbedding);
      const isMatched = distance < PROCTOR_CONFIG.MATCH_THRESHOLD;
      
      setVerified(isMatched);
      
      if (!isMatched) {
        addViolation('face_mismatch', `Face mismatch detected (Distance: ${distance.toFixed(2)})`);
      }

      if (onVerificationChange) onVerificationChange(isMatched);

    } catch (error) {
      console.error('Face detection error:', error);
    }
  }

  // Handle fullscreen re-entry
  async function handleReenterFullscreen() {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setCurrentStep('active');
      if (onEditorBlur) onEditorBlur(false);
    } catch (error) {
      console.error('Failed to re-enter fullscreen:', error);
      toast.error('Failed to enable fullscreen');
    }
  }

  async function endProctor() {
    if (!active || ending) return;
    setEnding(true);
    try {
      if (sessionId) {
        try {
          const report = {
             uptime: Date.now() - startTimeRef.current,
             violationCount,
             tabSwitchCount,
             warnings
          };
          await axios.post("/api/proctor/session", { action: "end", sessionId, report });
        } catch {}
      }
    } finally {
      // Clear face detection interval
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      
      const s = streamRef.current;
      if (s) {
        s.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setActive(false);
      if (onActiveChange) onActiveChange(false);
      setEnding(false);
      setSessionId(null);
    }
  }

  // Auto-initialize camera when capture step is shown
  useEffect(() => {
    if (currentStep === 'capture' && !streamRef.current && !faceCaptured && scriptLoaded) {
      // Auto-setup camera when capture step is shown (only if script is loaded)
      setupCameraForCapture().catch(err => {
        console.error('Auto camera setup failed:', err);
      });
    }
  }, [currentStep, faceCaptured, scriptLoaded]);

  useEffect(() => {
    if (autoStart && currentStep === 'capture') {
      // Auto-start: begin with capture step
      setCurrentStep('capture');
      if (onEditorBlur) onEditorBlur(true); // Blur editor initially
    }
    
    // Tab visibility monitoring
    const handleVisibilityChange = () => {
      if (document.hidden && active) {
        addViolation('tab_switch', 'Student switched tabs or minimized window');
      }
    };
    
    // Fullscreen monitoring
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && active && currentStep === 'active') {
        // Show fullscreen warning popup
        setCurrentStep('fullscreen_warning');
        if (onEditorBlur) onEditorBlur(true); // Blur editor
      } else if (document.fullscreenElement && currentStep === 'fullscreen_warning') {
        // User re-entered fullscreen
        setCurrentStep('active');
        if (onEditorBlur) onEditorBlur(false); // Unblur editor
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      const s = streamRef.current;
      if (s) s.getTracks().forEach(t => t.stop());
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [autoStart, active, currentStep]);

  function monitorLoop() {
    if (!active) return;
    
    // Audio Level
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(avg);
      
      if (avg > 50) { // Threshold for "loud" noise
        // Could add audio violation here if needed
      }
    }

    if (active) {
        requestAnimationFrame(monitorLoop);
    }
  }

  // Render different UI based on current step
  
  if (currentStep === 'permission') {
    return (
      <>
        {currentViolation && (
          <ViolationModal 
            message={currentViolation.message} 
            onContinue={handleViolationContinue} 
          />
        )}
        <Script
          src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
          onLoad={() => setScriptLoaded(true)}
        />
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Grant Permissions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please grant camera, microphone, and fullscreen permissions to start proctoring
              </p>
              <button
                onClick={requestPermissions}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Grant Permissions
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  if (currentStep === 'capture') {
    return (
      <>
        <Script
          src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
          onLoad={() => setScriptLoaded(true)}
        />
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Capture Your Face
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Position your face in the camera and click "Capture Face" to register your identity
              </p>
              
              <div className="relative aspect-video bg-black rounded-lg mb-6 overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover transform -scale-x-100" 
                  muted 
                  playsInline 
                  autoPlay
                />
                {!faceCaptured && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white text-center">
                      <Camera size={48} className="mx-auto mb-2" />
                      <p>Position your face here</p>
                      <p className="text-xs mt-2 opacity-75">Make sure your face is clearly visible</p>
                    </div>
                  </div>
                )}
                {faceCaptured && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-green-600/90 text-white text-sm px-3 py-2 rounded flex items-center justify-center gap-2">
                      <AlertTriangle size={16} />
                      <span>Face captured successfully!</span>
                    </div>
                  </div>
                )}
                {/* Video status indicator */}
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur px-2 py-1 rounded text-white text-xs">
                    <div className={`w-2 h-2 rounded-full ${videoRef.current?.readyState && videoRef.current.readyState >= 2 ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                    <span>{videoRef.current?.readyState && videoRef.current.readyState >= 2 ? 'Camera Ready' : 'Camera Loading'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={captureFace}
                  disabled={faceCaptured}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {faceCaptured ? 'Captured' : 'Capture'}
                </button>
                <button
                  onClick={retakeFace}
                  disabled={!faceCaptured}
                  className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Re-Take
                </button>
                <button
                  onClick={saveAndProceed}
                  disabled={!faceCaptured}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Save and Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  if (currentStep === 'fullscreen_warning') {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Enable Fullscreen Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You exited fullscreen mode. Please re-enter fullscreen to continue with the assessment.
            </p>
            <button
              onClick={handleReenterFullscreen}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Enable Fullscreen
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  
  // Active state - show draggable proctor window
  if (currentStep === 'active') {
    if (minimized) {
      return (
        <>
          {currentViolation && (
            <ViolationModal 
              message={currentViolation.message} 
              onContinue={handleViolationContinue} 
            />
          )}
          <div className="fixed top-4 right-4 z-[110]">
            <button
              onClick={() => setMinimized(false)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors animate-pulse"
              title="Restore Proctor View"
            >
              <Camera size={24} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
          </div>
        </>
      );
    }
    
    return (
      <>
        <Script
          src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
          onLoad={() => setScriptLoaded(true)}
        />
        <motion.div 
            drag 
            dragControls={dragControls}
            dragMomentum={false}
            initial={{ x: 20, y: 20 }}
            className="fixed top-20 right-8 z-[110] w-64 rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          {/* Header */}
          <div 
            className="h-8 bg-gray-100 dark:bg-gray-800 flex items-center justify-between px-3 cursor-move select-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                <Move size={12} />
                <span>Proctoring Active</span>
            </div>
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => setMinimized(true)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                    <Minimize2 size={12} />
                </button>
            </div>
          </div>

          {/* Video Content */}
          <div className="relative aspect-video bg-black group">
            <video 
                ref={videoRef} 
                className="w-full h-full object-cover transform -scale-x-100" 
                muted 
                playsInline 
                autoPlay
            />
            
            {/* Overlays */}
            {/* REMOVED SIDE WARNING per user request */}

            <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur px-2 py-1 rounded text-white text-xs">
                    <div className={`w-2 h-2 rounded-full ${verified ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>{verified ? "Verified" : "Unknown"}</span>
                </div>
                
                {/* Audio Visualizer */}
                <div className="h-8 w-1 bg-gray-800 rounded-full overflow-hidden flex flex-col justify-end">
                    <div 
                        className="w-full bg-green-500 transition-all duration-75"
                        style={{ height: `${Math.min(audioLevel, 100)}%` }}
                    />
                </div>
            </div>
          </div>

          {/* Violation Stats */}
          {violationCount > 0 && (
              <div className="px-3 py-2 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/20">
                  <p className="text-xs text-red-600 font-medium flex items-center justify-between">
                      <span>Violations Detected</span>
                      <span className="bg-red-100 dark:bg-red-900/30 px-1.5 rounded text-[10px]">{violationCount}</span>
                  </p>
              </div>
          )}
          
          {/* Footer Controls */}
          <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex justify-between">
             <button 
                onClick={endProctor}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
             >
                 End Session
             </button>
          </div>
        </motion.div>
      </>
    );
  }
  
  // Show violation popup on top of active state
  // (Moved logic up to prioritize over active state)
  
  // Default fallback
  return null;
}
