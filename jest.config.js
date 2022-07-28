// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'html'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transformIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: [],
  coveragePathIgnorePatterns: ['/scripts/'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  rootDir: __dirname,
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
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
