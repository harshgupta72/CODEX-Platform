"use client";

import { EventEmitter } from "events";

/**
 * Centralized Event Bus for modular proctoring communication.
 * Ensures loose coupling between UI, AI Detection, and Suspicion Engine.
 */
class ProctorEventBus extends EventEmitter {
  private static instance: ProctorEventBus;

  private constructor() {
    super();
    this.setMaxListeners(50);
  }

  public static getInstance(): ProctorEventBus {
    if (!ProctorEventBus.instance) {
      ProctorEventBus.instance = new ProctorEventBus();
    }
    return ProctorEventBus.instance;
  }
}

export const proctorEvents = ProctorEventBus.getInstance();

export const PROCTOR_EVENTS = {
  // Detection Events
  FACE_DETECTED: "detection:face",
  FACE_LOST: "detection:face_lost",
  MULTIPLE_FACES: "detection:multiple_faces",
  HEAD_POSE_CHANGED: "detection:head_pose",
  ATTENTION_LOST: "detection:attention_lost",
  GAZE_CHANGED: "detection:gaze",
  
  // Monitoring Events
  TAB_SWITCHED: "monitor:tab_switch",
  FULLSCREEN_EXIT: "monitor:fullscreen_exit",
  CLIPBOARD_PASTE: "monitor:paste",
  DEVTOOLS_OPENED: "monitor:devtools",
  
  // Suspicion & Logic
  SUSPICION_CHANGED: "logic:suspicion_change",
  VIOLATION_TRIGGERED: "logic:violation",
  WARNING_SHOWN: "ui:warning",
  
  // AI Screen/Code Analyzer
  CODE_ANALYSIS_START: "ai:code_analysis_start",
  CODE_ANALYSIS_END: "ai:code_analysis_end",
  SCREEN_SUSPICIOUS_ACTIVITY: "ai:screen_suspicious",
  
  // Lifecycle
  PROCTOR_STARTED: "lifecycle:start",
  PROCTOR_STOPPED: "lifecycle:stop",
  PROCTOR_TERMINATED: "lifecycle:terminate"
};
