jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));
