import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'uploads/**', '.mongo-data/**'] },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
];
