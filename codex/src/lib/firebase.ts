import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { hasFirebaseConfig } from "@/lib/env";

export type FirebaseServices = {
  auth: Auth;
  db: Firestore;
  app: FirebaseApp;
  googleProvider: GoogleAuthProvider;
};

// Sanitize env and normalize storage bucket domain if misconfigured
const rawStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const normalizedStorageBucket = rawStorageBucket?.endsWith(".firebasestorage.app")
  ? rawStorageBucket.replace(".firebasestorage.app", ".appspot.com")
  : rawStorageBucket;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: normalizedStorageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

export function getFirebase(): FirebaseServices {
  if (!hasFirebaseConfig()) {
    // Return mock services when Firebase is not configured
    const mockAuth = {} as Auth;
    const mockDb = {} as Firestore;
    const mockApp = {} as FirebaseApp;
    const mockProvider = {} as GoogleAuthProvider;
    return { app: mockApp, auth: mockAuth, db: mockDb, googleProvider: mockProvider };
  }
  
  try {
    const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    try {
      // Ensure session persists across tabs and browser restarts
      void setPersistence(auth, browserLocalPersistence);
    } catch {}
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();
    return { app, auth, db, googleProvider };
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
    // Return mock services on error
    const mockAuth = {} as Auth;
    const mockDb = {} as Firestore;
    const mockApp = {} as FirebaseApp;
    const mockProvider = {} as GoogleAuthProvider;
    return { app: mockApp, auth: mockAuth, db: mockDb, googleProvider: mockProvider };
  }
}

