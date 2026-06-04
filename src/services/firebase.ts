import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

export const getFirebaseApp = () => {
  if (!app) {
    app = getApps()[0] ?? initializeApp(getFirebaseConfig());
  }
  return app;
};

export const getFirebaseDb = () => {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
};

const getFirebaseConfig = (): FirebaseOptions => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'scout-life-balance';

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
};
