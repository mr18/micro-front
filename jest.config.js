// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  verbose: true,
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'html'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transformIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: [],
  coveragePathIgnorePatterns: ['/scripts/'],
  testEnvironment: 'jest-environment-jsdom',
  coverageProvider: 'v8',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  rootDir: __dirname,
  modulePaths: ['<rootDir>/'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  coverageThreshold: {
    global: {
      // branches: 100,
      // functions: 100,
      // statements: 100,
      // lines: 100,
    },
  },
  globals: {
    __DEV__: true,
    __TEST__: true,
    'ts-jest': {
      tsconfig: {
        target: 'es5',
        noUnusedLocals: true,
        strictNullChecks: true,
        noUnusedParameters: true,
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
