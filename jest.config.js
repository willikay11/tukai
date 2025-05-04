const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@hugeicons/react-pro$': '<rootDir>/__mocks__/@hugeicons/react-pro.js', // Mock for HugeIcons
  },
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest', // Add this line to handle TypeScript/JSX transformation
    '^.+\\.(js|jsx)$': 'babel-jest', // Add this line to handle JS/JSX transformation
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@hugeicons/)', // If you're using libraries in node_modules that need transformation, add them here
  ],
}

module.exports = createJestConfig(customJestConfig)
