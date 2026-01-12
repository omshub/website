jest.mock('firebase/storage', () => ({
  connectStorageEmulator: jest.fn(),
  getStorage: jest.fn(),
}));
