import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  response.send('Hello from Firebase!');
});

// TODO: ADD CLOUD FUNCTIONS FOR DATA DUMPING TO GOOGLE DRIVE, AND INVESTIGATE
// REFACTORING EXISTING FIRESTORE LOGIC TO CLOUD FUNCTIONS
