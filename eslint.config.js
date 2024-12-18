import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				project: ['./packages/*/tsconfig.json'],
				tsconfigRootDir: import.meta.dirname
			}
		}
	},
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			// TypeScript
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_'
			}],
			'@typescript-eslint/consistent-type-imports': ['error', {
				prefer: 'type-imports'
			}],

			// General
			'no-console': ['warn', {
				allow: ['warn', 'error']
			}],
			'prefer-const': 'error',
			'eqeqeq': ['error', 'always', {
				null: 'ignore'
			}]
		}
	},
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.turbo/**',
			'**/coverage/**'
		]
	},
)

