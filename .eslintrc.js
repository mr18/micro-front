module.exports = {
  parser: '@typescript-eslint/parser', // babel-eslint
  plugins: ['@typescript-eslint'],
  extends: ['standard', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  globals: {},
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    'lines-between-class-members': 0,
    'no-new-func': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'no-use-before-define': 0,
    'new-cap': 0,
    'one-var': 0,
    '@typescript-eslint/no-use-before-define': 1,
    'no-empty-function': 0,
    '@typescript-eslint/no-empty-function': 0,
  },
};
