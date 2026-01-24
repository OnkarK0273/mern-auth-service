import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      'no-console': 'warn',
      'dot-notation': 'off',
    },
  },
  {
    ignores: ['dist', 'node_modules', 'eslint.config.mjs'],
  },
);
