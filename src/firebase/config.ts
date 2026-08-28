import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import configJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: configJson.projectId,
  appId: configJson.appId,
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
};

// Initialize Firebase App instance safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific databaseId if provided
const databaseId = configJson.firestoreDatabaseId || '(default)';
export const db = initializeFirestore(app, {}, databaseId);

// Initialize Storage
export const storage = getStorage(app);

export const FIREBASE_CONFIG_METADATA = {
  projectId: configJson.projectId,
  databaseId: databaseId,
  authDomain: configJson.authDomain,
  schoolName: 'Uwezo Elite School',
};
