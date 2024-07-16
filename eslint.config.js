import globals from 'globals'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier/recommended'

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    ignores: ['dist/', 'node_modules/'],
  },
  {
    rules: {
      'prettier/prettier': 1,
      '@typescript-eslint/no-unused-vars': 1,
      '@typescript-eslint/no-explicit-any': 0,
    },
  },
]
