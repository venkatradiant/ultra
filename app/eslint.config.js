import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Newly introduced rule sets — surfaced as warnings during the strangler
      // migration, promoted to errors in Phase 7 once legacy screens are gone.
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  // Node-context files (run by Vite/Node/Vercel functions, not the browser).
  {
    files: ['vite.config.js', 'eslint.config.js', 'api/**'],
    languageOptions: { globals: { ...globals.node } },
  },
  // Legacy quarantine — the pre-refactor screens/components are being replaced
  // by the domain-module architecture (see plan Phases 3–5). Until each file is
  // migrated or deleted, the newly-introduced strict rules run as warnings here
  // so they're visible without blocking. New code under core/ shared/ domains/
  // config/ is held to the full bar (errors). Phase 7 deletes this block.
  {
    files: [
      'src/screens/**',
      'src/components/**',
      'src/context/**',
      'src/data/**',
      'src/demo/**',
      'src/hooks/**',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-refresh/only-export-components': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      // Real latent bugs (duplicate chip→flow keys silently override) surfaced
      // as warnings; resolved with intent during the Phase 5 flow migration.
      'no-dupe-keys': 'warn',
    },
  },
])
