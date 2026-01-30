import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
  // Add '<rootDir>/test' here (assuming your folder is named "test")
  roots: ['<rootDir>/src', '<rootDir>/tests'],
};

export default config;
