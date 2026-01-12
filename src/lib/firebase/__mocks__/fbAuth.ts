jest.mock('firebase/auth', () => ({
  connectAuthEmulator: jest.fn(),
  getAuth: jest.fn(),
}));
