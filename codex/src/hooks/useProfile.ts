import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import toast from "react-hot-toast";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string;
  bio: string;
  phone: string;
  learning_goal: string;
  github_url: string;
  linkedin_url: string;
  role: "student" | "teacher";
  created_at: any;
  updated_at: any;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { db } = getFirebase();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as Profile);
        } else {
          // Fallback if profile is missing (edge case)
          console.warn("Profile missing for user:", user.uid);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, db]);

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;

    try {
      const profileRef = doc(db, "profiles", user.uid);
      const updateData = {
        ...data,
        updated_at: serverTimestamp(),
      };
      
      await updateDoc(profileRef, updateData);

      // Also update the main users collection if full_name is changed
      if (data.full_name) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          displayName: data.full_name
        });
      }

      setProfile((prev) => prev ? { ...prev, ...updateData } : null);
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return false;
    }
  };

  return { profile, loading, updateProfile, setProfile };
}
