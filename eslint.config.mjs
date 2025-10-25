import nextConfig from 'eslint-config-next';

export default [
  ...nextConfig,
  {
    ignores: ['node_modules', '.next']
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      '@next/next/no-img-element': 'warn',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
