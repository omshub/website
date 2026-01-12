import { TKeyMap } from '@/lib/types';

type TDataDocumentsObject = {
  [dataDocuments: string]: string;
};

export const coreDataDocuments: TDataDocumentsObject = {
  COURSES: 'courses',
};

export const baseCollectionCoreData = 'coreData';
export const baseCollectionReviewsData = 'reviewsData';
export const baseCollectionReviewsDataFlat = '_reviewsDataFlat';
export const baseCollectionRecentsData = 'recentsData';
export const baseCollectionUsersData = 'usersData';

// Firebase emulators
export const LOCALHOST = 'localhost';

// reference: https://firebase.google.com/docs/emulator-suite/install_and_configure#port_configuration
export const firebaseEmulatorPorts: TKeyMap = {
  AUTH: 9099,
  FUNCTIONS: 5001,
  FIRESTORE: 8080,
  HOSTING: 5000,
  STORAGE: 9199,
  UI: 4000,
};
