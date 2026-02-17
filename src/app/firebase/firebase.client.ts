import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseOptions } from 'firebase/app';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    __FIREBASE_CONFIG__?: FirebaseOptions;
  }
}

function getFirebaseConfig(): FirebaseOptions {
  const runtimeConfig = typeof window !== 'undefined' ? window.__FIREBASE_CONFIG__ : undefined;

  if (runtimeConfig?.apiKey && runtimeConfig?.projectId && runtimeConfig?.appId) {
    return runtimeConfig;
  }

  const envConfig = environment.firebase as FirebaseOptions;
  if (envConfig?.apiKey && envConfig?.projectId && envConfig?.appId) {
    console.warn('Using Firebase config from environment fallback.');
    return envConfig;
  }

  console.error(
    'Firebase config ausente. Crie public/firebase-config.js a partir de public/firebase-config.example.js.'
  );

  return {
    apiKey: 'missing',
    appId: 'missing',
    projectId: 'missing'
  };
}

const firebaseApp = getApps().length ? getApp() : initializeApp(getFirebaseConfig());

export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
