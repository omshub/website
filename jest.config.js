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
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/context/(.*)$': '<rootDir>/src/context/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '@backend/(.*)$': '<rootDir>/src/lib/firebase/$1',
    '@src/(.*)$': '<rootDir>/src/$1',
    '^@tabler/icons-react$': '<rootDir>/test/mocks/tabler-icons-react.js',
    '^@tabler/icons-react/.*$': '<rootDir>/test/mocks/tabler-icons-react.js',
    // Firebase modules mocks
    'firebase/app': '<rootDir>/src/lib/firebase/__mocks__/fbApp.ts',
    'firebase/auth': '<rootDir>/src/lib/firebase/__mocks__/fbAuth.ts',
    'firebase/firestore': '<rootDir>/src/lib/firebase/__mocks__/fbFirestore.ts',
    'firebase/storage': '<rootDir>/src/lib/firebase/__mocks__/fbStorage.ts',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/.next/'],
  modulePathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/.next/'],
  transformIgnorePatterns: ['/node_modules/(?!@tabler/icons-react/)'],
  collectCoverageFrom: [
    'app/api/**/*.{ts,tsx}',
    'app/auth/**/*.{ts,tsx}',
    'scripts/**/*.js',
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{js,ts,tsx}',
    '!**/*.stories.{ts,tsx}',
    '!src/lib/supabase/database.types.ts',
  ],
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
