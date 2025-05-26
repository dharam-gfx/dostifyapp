import nextJest from 'next/jest.js';

const createJestConfig = nextJest( {
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
} );

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
    // Add more setup options before each test is run
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // Test environment that will be used for testing
    testEnvironment: 'jest-environment-jsdom',

    // Explicitly resolve paths to make it clearer for Jest
    modulePaths: ['<rootDir>'],

    // Handle module aliases
    moduleNameMapper: {
        // Handle CSS imports (with CSS modules)
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        // Handle CSS imports (without CSS modules)
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.ts',
        // Handle image imports
        '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$': '<rootDir>/__mocks__/fileMock.ts',
        // Handle module aliases - ensure these match your tsconfig paths
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
    ],
    transform: {
        // Use babel-jest to transpile tests with the next/babel preset
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig( config );
