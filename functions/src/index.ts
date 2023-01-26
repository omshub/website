import * as functions from 'firebase-functions';
// import { dbAdmin } from './dbConfig';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https
    // @ts-ignore
    .onRequest((request, response) => {
      functions.logger.info('Hello logs!', { structuredData: true });
      response.send('Hello from Firebase!');
    });

// TODO: ADD CLOUD FUNCTIONS FOR DATA DUMPING TO GOOGLE DRIVE, AND INVESTIGATE
// REFACTORING EXISTING FIRESTORE LOGIC TO CLOUD FUNCTIONS
