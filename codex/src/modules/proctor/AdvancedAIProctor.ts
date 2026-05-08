"use client";

import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { proctorEvents, PROCTOR_EVENTS } from '../event-engine/ProctorEventBus';
import { useProctorStore } from '../monitoring/ProctorStore';

export function useAdvancedAIProctor(videoRef: React.RefObject<HTMLVideoElement>) {
  const isEnabled = useProctorStore(state => state.isEnabled);
  const setHeadPose = useProctorStore(state => state.setHeadPose);
  const setPersonCount = useProctorStore(state => state.setPersonCount);
  const updateSuspicion = useProctorStore(state => state.updateSuspicion);
  
  const frameCountRef = useRef(0);
  const lastAttentionRef = useRef(Date.now());

  useEffect(() => {
    if (!isEnabled || !videoRef.current) return;

    let mounted = true;
    let detectionInterval: NodeJS.Timeout;

    const detect = async () => {
      if (!mounted || !videoRef.current || videoRef.current.paused) return;

      // Throttle webcam analysis to max 5 FPS for performance
      frameCountRef.current++;
      if (frameCountRef.current % 3 !== 0) return; 

      try {
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 });
        const detections = await faceapi.detectAllFaces(videoRef.current, options)
          .withFaceLandmarks();

        if (detections.length === 0) {
          proctorEvents.emit(PROCTOR_EVENTS.FACE_LOST);
          // Only penalize if away for too long
          if (Date.now() - lastAttentionRef.current > 3000) {
             updateSuspicion(0.5); 
          }
        } else {
          lastAttentionRef.current = Date.now();
          setPersonCount(detections.length);

          if (detections.length > 1) {
            proctorEvents.emit(PROCTOR_EVENTS.MULTIPLE_FACES, detections.length);
            updateSuspicion(5);
          }

          // Calculate Head Pose (Simplified approximation from landmarks)
          const landmarks = detections[0].landmarks;
          const nose = landmarks.getNose()[0];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[0];
          
          // Basic Yaw (Left/Right)
          const eyeMidpointX = (leftEye.x + rightEye.x) / 2;
          const yaw = (nose.x - eyeMidpointX) / (rightEye.x - leftEye.x);
          
          // Basic Pitch (Up/Down)
          const eyeMidpointY = (leftEye.y + rightEye.y) / 2;
          const pitch = (nose.y - eyeMidpointY) / (rightEye.y - leftEye.y);

          const pose = { yaw, pitch, roll: 0 };
          setHeadPose(pose);
          proctorEvents.emit(PROCTOR_EVENTS.HEAD_POSE_CHANGED, pose);

          // Threshold for "Looking Away"
          if (Math.abs(yaw) > 0.6 || Math.abs(pitch) > 0.8) {
            proctorEvents.emit(PROCTOR_EVENTS.ATTENTION_LOST);
            updateSuspicion(1);
          }
        }
      } catch (err) {
        console.error("AI Proctor Inference Error:", err);
      }
    };

    detectionInterval = setInterval(detect, 200); // 5 FPS

    return () => {
      mounted = false;
      clearInterval(detectionInterval);
    };
  }, [isEnabled, videoRef, setHeadPose, setPersonCount, updateSuspicion]);

  return null;
}
