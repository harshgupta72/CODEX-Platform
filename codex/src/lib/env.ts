export const env = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  judge0: {
    url: process.env.JUDGE0_API_URL,
    key: process.env.JUDGE0_API_KEY,
  },
};

export function hasFirebaseConfig(): boolean {
  const f = env.firebase;
  return Boolean(f.apiKey && f.authDomain && f.projectId && f.appId);
}




















