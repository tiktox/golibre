
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Explicitly check if all essential Firebase config values are available during initialization.
// This will help determine if the environment variables are being read correctly by Vercel at build time.
if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
  const missingVars = [];
  if (!apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  
  throw new Error(
    `One or more Firebase environment variables are not set or not available in the build environment. ` +
    `Please check your Vercel environment variable configuration. Missing or empty: ${missingVars.join(', ')}.` +
    ` Ensure they are correctly set in your Vercel project settings for the Production environment.`
  );
}

// measurementId is optional for core Firebase functionality but include if used.
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId, // This will be undefined if not set, which is acceptable for initializeApp
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, auth, googleProvider, db, storage };
