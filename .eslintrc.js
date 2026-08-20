module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'import'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/no-default-export': ['error'],
  },
  overrides: [
    {
      // Next.js requires a default export from these App Router files
      files: [
        '**/page.tsx',
        '**/layout.tsx',
        '**/route.ts',
        '**/error.tsx',
        '**/global-error.tsx',
        '**/not-found.tsx',
        '**/loading.tsx',
        '**/template.tsx',
      ],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
  env: {
    browser: true,
    node: true,
    jest: true,
    es2021: true,
  },
};
