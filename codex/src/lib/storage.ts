import { hasFirebaseConfig } from "@/lib/env";
import { getFirebase } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadFile(path: string, file: File): Promise<string> {
  if (!hasFirebaseConfig()) throw new Error("Firebase not configured");
  const { app } = getFirebase();
  const storage = getStorage(app);
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snap.ref);
  return url;
}

export function buildPath(parts: string[]): string {
  return parts.map(p => p.replace(/\/+$/g, "").replace(/^\/+/, "")).join("/");
}
