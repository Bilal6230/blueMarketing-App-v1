module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  ignorePatterns: ['dist', '.expo', 'coverage'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
};
