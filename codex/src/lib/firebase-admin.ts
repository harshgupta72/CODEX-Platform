import admin from "firebase-admin";

let initialized = false;

function init() {
  if (initialized) return;
  if (!admin.apps.length) {
    try {
      admin.initializeApp();
    } catch {}
  }
  initialized = true;
}

export async function verifyIdToken(idToken: string) {
  init();
  if (!idToken) throw new Error("Missing token");
  if (!admin.apps.length) throw new Error("Firebase Admin not configured");
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded;
}
