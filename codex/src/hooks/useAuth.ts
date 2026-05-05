"use client";
import { useEffect, useMemo, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { hasFirebaseConfig } from "@/lib/env";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export type UserRole = "student" | "teacher";

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  userType: UserRole;
  userId: string;
};

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to ensure loading doesn't hang forever
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 second timeout

    // Check if Firebase is properly configured FIRST, before trying to get Firebase services
    if (!hasFirebaseConfig()) {
      clearTimeout(timeoutId);
      setLoading(false);
      return;
    }

    try {
      const { auth, db } = getFirebase();
      
      // Double check that auth is valid (not a mock object)
      if (!auth || typeof auth !== 'object' || !('onAuthStateChanged' in auth)) {
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      const unsub = onAuthStateChanged(auth, async (u) => {
        setFirebaseUser(u);
        if (!u) {
          setAppUser(null);
          setLoading(false);
          return;
        }
        
        try {
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            // If user doesn't exist in our database, create a default user profile
            // This handles the case where a new user signs up
            const defaultUserData = {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL,
              userType: "student" as UserRole,
              userId: u.uid, // Use Firebase UID as userId
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            // Optional: allow client-side writes only when explicitly enabled
            const allowClientWrites = process.env.NEXT_PUBLIC_FIRESTORE_ALLOW_CLIENT_WRITES === 'true';
            if (allowClientWrites) {
              try {
                await setDoc(ref, defaultUserData);
              } catch (err) {
                console.warn("Firestore write ignored:", err);
              }
            }
            
            setAppUser({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL,
              userType: "student",
              userId: u.uid,
            });
          } else {
            const data = snap.data() as any;
            setAppUser({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL,
              userType: (data?.userType as UserRole) || "student",
              userId: data?.userId || u.uid,
            });
          }
        } catch (error) {
          console.warn("Error fetching user data:", error);
          // If there's an error (like offline), still set the user but with default values
          setAppUser({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL,
            userType: "student",
            userId: u.uid,
          });
        }
        setLoading(false);
      });
      return () => {
        clearTimeout(timeoutId);
        unsub();
      };
    } catch (error) {
      console.warn("Auth initialization failed:", error);
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(firebaseUser), [firebaseUser]);
  return { user: appUser, loading, isAuthenticated };
}







