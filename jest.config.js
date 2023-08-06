const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '@backend/(.*)$': '<rootDir>/firebase/$1',
    '@src/(.*)$': '<rootDir>/src/$1',
    'firebase/app': '<rootDir>/firebase/__mocks__/fbApp.ts',
    'firebase/auth': '<rootDir>/firebase/__mocks__/fbAuth.ts',
    'firebase/firestore': '<rootDir>/firebase/__mocks__/fbFirestore.ts',
    'firebase/storage': '<rootDir>/firebase/__mocks__/fbStorage.ts',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
