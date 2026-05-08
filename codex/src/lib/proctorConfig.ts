export const PROCTOR_CONFIG = {
  // Thresholds for face matching
  MATCH_THRESHOLD: 0.62,
  MISMATCH_THRESHOLD: 0.72,
  
  // Monitoring intervals (ms)
  DETECTION_INTERVAL: 1000, // Check every 1s
  LIVENESS_CHECK_INTERVAL: 2000,
  
  // Violations
  MAX_WARNINGS: 12,
  VIOLATION_DEBOUNCE_FRAMES: 3,
  GRACE_PERIOD_MS: 5000, // 5s grace period at start
  
  // Paths
  MODELS_URI: '/models',
  BEEP_AUDIO_SRC: '/audio/beep.mp3',
  
  // Messages
  STATUS_MESSAGES: {
    SETUP: "Please align your face in the camera.",
    ACTIVE: "Proctoring active. Keep your face visible.",
    NOT_DETECTED: "Face not detected!",
    MULTIPLE_FACES: "Multiple faces detected!",
    MISMATCH: "Face does not match registered user!",
    CAMERA_BLOCKED: "Camera access blocked or revoked!",
    LOADING: "Loading proctoring system...",
  },
  
  VIOLATION_MESSAGES: {
    NOT_DETECTED: "Face not detected",
    MISMATCH: "Identity verification failed",
    MULTIPLE_FACES: "Multiple people detected",
    CAMERA_OFF: "Camera is turned off",
    FULLSCREEN_EXIT: "Fullscreen has been disabled",
  }
};
