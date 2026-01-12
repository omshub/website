// Import the functions you need from the SDKs you need
import { FirebaseOptions, initializeApp } from 'firebase/app';
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { firebaseEmulatorPorts, LOCALHOST } from '@/lib/firebase/constants';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app & services
const firebaseApp = initializeApp(config);
export const auth = getAuth();
export const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

/* --- FIREBASE EMULATORS CONFIGS --- */

// N.B. Set environment var `NEXT_PUBLIC_IS_EMULATOR_MODE=true` in `.env` to use local Firebase emulator (emulator must
// be running via `yarn fb:emu` first before starting the app via `yarn dev`)
const isEmulatorMode =
  process.env.NEXT_PUBLIC_IS_EMULATOR_MODE?.toLowerCase() === 'true';
const isEmulatorEnvironment = process.env.NODE_ENV === 'development';
if (isEmulatorMode && isEmulatorEnvironment) {
  // prevent multiple Firestore emulator connections on re-render -- reference: https://stackoverflow.com/a/74727587
  const host =
    (db.toJSON() as { settings?: { host?: string } }).settings?.host ?? '';
  if (!host.startsWith(LOCALHOST)) {
    connectFirestoreEmulator(db, LOCALHOST, firebaseEmulatorPorts.FIRESTORE);
  }

  connectAuthEmulator(
    auth,
    `http://${LOCALHOST}:${firebaseEmulatorPorts.AUTH}`,
  );
  connectStorageEmulator(storage, LOCALHOST, firebaseEmulatorPorts.STORAGE);
}
