import { getFirebase } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export type UserRole = "teacher" | "student";

export interface UserProfileData {
  uid: string;
  role: UserRole;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  department?: string;
  employeeId?: string; // for teachers
  studentId?: string;  // for students
  // Registration details
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bio?: string;
  institution?: string;
  degree?: string;
  major?: string;
  graduationYear?: string;
  gpa?: string;
  jobTitle?: string;
  company?: string;
  experience?: string;
  linkedIn?: string;
  github?: string;
  programmingLanguages?: string[];
  frameworks?: string[];
  interests?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export async function getUserDoc(uid: string): Promise<UserProfileData | null> {
  const { db } = getFirebase();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfileData;
}

export async function upsertUserDoc(uid: string, data: Partial<UserProfileData>) {
  const { db } = getFirebase();
  const ref = doc(db, "users", uid);
  // Remove undefined values to avoid Firestore "Unsupported field value: undefined"
  const sanitizedEntries = Object.entries({ ...data, uid }).filter(([, value]) => value !== undefined);
  const sanitizedData = Object.fromEntries(sanitizedEntries) as Partial<UserProfileData> & { uid: string };
  await setDoc(
    ref,
    { ...sanitizedData, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function updateUserRole(uid: string, role: UserRole) {
  const { db } = getFirebase();
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { role, updatedAt: serverTimestamp() });
}


