module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:storybook/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
  },
  overrides: [
    {
      files: ['cypress/**/*.ts', 'e2e/**/*.ts'],
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
      },
    },
    {
      files: ['src/core/**/*.ts', 'src/core/**/*.vue'],
      excludedFiles: [
        'src/core/router/route-mode.ts',
        'src/core/router/dynamic.ts',
        'src/core/router/guards.ts',
        'src/core/router/routes.ts',
        'src/core/**/*.test.ts',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/features/*', '../features/*', '../../features/*'],
                message: 'Core layer must not import from features.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/shared/**/*.ts', 'src/shared/**/*.vue'],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              {
                group: [
                  '@/features/*/api',
                  '@/features/*/store/*',
                  '@/features/*/views/*',
                  '@/features/*/components/*',
                ],
                message: 'Shared layer should not import from feature internals.',
              },
            ],
          },
        ],
      },
    },
  ],
}
