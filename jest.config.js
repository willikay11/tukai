/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@hugeicons/react-pro$': '<rootDir>/__mocks__/@hugeicons/react-pro.js', // Mock for HugeIcons
    '^@hugeicons/react$': '<rootDir>/__mocks__/@hugeicons/react.js', // ESM package jest can't parse
    '^@hugeicons-pro/core-twotone-rounded$':
      '<rootDir>/__mocks__/@hugeicons-pro/core-twotone-rounded.js', // ESM package jest can't parse
    '^@hugeicons-pro/core-solid-rounded$':
      '<rootDir>/__mocks__/@hugeicons-pro/core-solid-rounded.js', // ESM package jest can't parse
    '^lucide-react$': '<rootDir>/__mocks__/lucide-react.js', // Mock for lucide-react
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

module.exports = createJestConfig(customJestConfig);
