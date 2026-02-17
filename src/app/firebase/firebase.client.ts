import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseOptions } from 'firebase/app';

declare global {
  interface Window {
    __FIREBASE_CONFIG__?: FirebaseOptions;
  }
}

function getFirebaseConfig(): FirebaseOptions {
  const config = window.__FIREBASE_CONFIG__;
  if (!config?.apiKey || !config?.projectId || !config?.appId) {
    throw new Error(
      'Firebase config ausente. Crie public/firebase-config.js a partir de public/firebase-config.example.js.'
    );
  }

  return config;
}

const firebaseApp = getApps().length ? getApp() : initializeApp(getFirebaseConfig());

export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
