module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parser: 'babel-eslint',
  plugins: ['jsdoc'],
  extends: ['eslint:recommended', 'plugin:jsdoc/recommended'],
  rules: {
    'jsdoc/check-examples': 1,
    // Use only as guidance. Set to 0 before "git add".
    'jsdoc/check-indentation': 0,
    'jsdoc/check-syntax': 1,
    'jsdoc/match-description': 1,
    'jsdoc/require-description': 1,
    // Use only as guidance. Set to 0 before "git add".
    'jsdoc/require-description-complete-sentence': 0
  }
};
