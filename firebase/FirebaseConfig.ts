// Import the functions you need from the SDKs you need
import { FirebaseOptions, initializeApp } from 'firebase/app'
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectAuthEmulator, getAuth } from 'firebase/auth'

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
}

// Initialize Firebase app & services
const firebaseApp = initializeApp(config)
export const auth = getAuth()
export const db = getFirestore(firebaseApp)

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
	console.log('env', process.env.NODE_ENV);

	// prevent multiple emulator attempts on re-render -- reference: https://stackoverflow.com/a/74727587
	const host = (db.toJSON() as { settings?: { host?: string } }).settings?.host ?? '';
	if (!host.startsWith('localhost')) {
		connectFirestoreEmulator(db, 'localhost', 8080)
	}

	connectAuthEmulator(auth, 'http://localhost:9099');
}
