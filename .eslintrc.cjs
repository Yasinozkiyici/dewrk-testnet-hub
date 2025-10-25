// .eslintrc.cjs
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist/**', '.next/**', 'playwright-report/**'],
  rules: {
    // Add project-specific tweaks here as needed
  }
};
