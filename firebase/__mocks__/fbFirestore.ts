jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({
    toJSON: jest.fn(() => ({
      settings: { host: '' },
    })),
  })),
  connectFirestoreEmulator: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));
