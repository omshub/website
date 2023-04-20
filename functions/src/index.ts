import * as functions from 'firebase-functions';
// import { storageAdmin } from './dbConfig';
// import { createBlobObjJSON } from './utilities';
// import { getStorage, ref, uploadBytes } from 'firebase/storage';

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
export const readAll = functions.firestore
    .document('_reviewsDataFlat/{reviewId}')
    // @ts-ignore
    .onCreate(async (change, context) => {
      const document = change.data() ?? null;
      functions.logger.info('DATA:\n', document);

      // reference: https://firebase.google.com/docs/storage/web/upload-files
      // const reviewsRef = ref(getStorage(firebaseApp) /* , 'reviews.json' */);
      // const reviewBlob = createBlobObjJSON(document);

      // storageAdmin.bucket().upload('test.json');

      // uploadBytes(reviewsRef, reviewBlob).then((snapshot) => {
      //   functions.logger.info('Uploaded blob!');
      // });
    });
