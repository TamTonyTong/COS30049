import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
// eslint.config.mjs
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig[
  // Base configuration
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply to all .ts and .tsx files
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn', // Enable globally but warn
    },
  },

  // Override for .tsx files
  {
    files: ['**/*.tsx'], // Apply only to .tsx files
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Disable the rule for .tsx files
    },
  },

  // React-specific configuration
  {
    ...reactRecommended,
    files: ['**/*.tsx'], // Apply only to .tsx files
    rules: {
      'react/prop-types': 'off', // Example: Disable React prop-types rule
    },
  },
]
