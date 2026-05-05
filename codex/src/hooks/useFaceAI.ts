"use client";

import { useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { PROCTOR_CONFIG } from '@/lib/proctorConfig';

export function useFaceAI() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [recognitionReady, setRecognitionReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadModels() {
      try {
        console.log("Loading FaceAPI models...");
        // Load lightweight models first for faster startup
        await Promise.all([
          faceapi.nets.faceLandmark68Net.loadFromUri(PROCTOR_CONFIG.MODELS_URI),
        ]);

        // Always load TinyFaceDetector as a lightweight option/fallback
        await faceapi.nets.tinyFaceDetector.loadFromUri(PROCTOR_CONFIG.MODELS_URI);

        if (mounted) {
          console.log("FaceAPI models loaded");
          setModelsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load FaceAPI models:", err);
        if (mounted) {
            setModelError("Failed to load face recognition models. Please ensure model files are in /public/models.");
        }
      }
    }

    loadModels();

    return () => {
      mounted = false;
    };
  }, []);

  const ensureRecognitionLoaded = useCallback(async () => {
    if ((faceapi.nets.faceRecognitionNet as any)?.isLoaded) {
      setRecognitionReady(true);
      return;
    }
    try {
      await faceapi.nets.faceRecognitionNet.loadFromUri(PROCTOR_CONFIG.MODELS_URI);
      setRecognitionReady(true);
    } catch (err) {
      console.error("Failed to load recognition net:", err);
    }
  }, []);

  const getFaceDescriptor = useCallback(async (video: HTMLVideoElement) => {
    if (!modelsLoaded) return null;

    // Use TinyFaceDetector by default for maximum speed and minimum load
    // This addresses the user's requirement for "fast speed with minimum load"
    let detection;
    try {
        // Ensure recognition net is available before requesting descriptor
        await ensureRecognitionLoaded();
        const options = new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 192,
            scoreThreshold: 0.4 
        });
        detection = await faceapi.detectSingleFace(video, options)
            .withFaceLandmarks()
            .withFaceDescriptor();
    } catch (err) {
        console.error("Face detection failed:", err);
        return null;
    }

    return detection;
  }, [modelsLoaded, ensureRecognitionLoaded]);

  const matchFace = useCallback((descriptor: Float32Array, referenceDescriptor: Float32Array) => {
    const distance = faceapi.euclideanDistance(descriptor, referenceDescriptor);
    return {
      match: distance < PROCTOR_CONFIG.MATCH_THRESHOLD,
      distance,
      isUncertain: distance >= PROCTOR_CONFIG.MATCH_THRESHOLD && distance <= PROCTOR_CONFIG.MISMATCH_THRESHOLD
    };
  }, []);

  // Simple liveness check based on landmark movement
  // We need history for this. This function just compares two sets of landmarks.
  const checkLiveness = useCallback((landmarks1: faceapi.FaceLandmarks68, landmarks2: faceapi.FaceLandmarks68) => {
    const p1 = landmarks1.positions[30];
    const p2 = landmarks2.positions[30];
    const distance = faceapi.euclideanDistance([p1.x, p1.y], [p2.x, p2.y]); // Nose tip movement
    // If distance is TOO small (0), it might be a static image feed (spoofing)
    // But over 500ms, a real person always moves slightly.
    return distance > 0.5; // Threshold for micro-movement
  }, []);

  return {
    modelsLoaded,
    modelError,
    getFaceDescriptor,
    matchFace,
    checkLiveness,
    ensureRecognitionLoaded,
    recognitionReady
  };
}
