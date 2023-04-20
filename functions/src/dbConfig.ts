import * as admin from 'firebase-admin';

// reference: https://firebase.google.com/docs/admin/setup
export const firebaseApp = admin.initializeApp();
export const dbAdmin = admin.firestore(firebaseApp);
export const storageAdmin = admin.storage(firebaseApp);
