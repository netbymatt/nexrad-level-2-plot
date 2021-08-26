module.exports = {
	root: true,
	env: {
		commonjs: true,
		node: true,
	},
	extends: [
		'airbnb-base',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
	},
	plugins: ['import'],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
		},
	},
	rules: {
		indent: [
			'error',
			'tab',
		],
		'no-use-before-define': [
			'error',
			{
				variables: false,
			},
		],
		// 'no-param-reassign': [
		// 	'error',
		// 	{
		// 		props: false,
		// 	},
		// ],
		'no-tabs': 0,
		'no-console': 0,
		'max-len': 0,
		'linebreak-style': 0,
		quotes: [
			'error',
			'single',
		],
		// semi: [
		// 	'error',
		// 	'always',
		// ],
		// 'no-prototype-builtins': 0,
		// 'comma-dangle': ['error', 'always-multiline'],
		// 'block-scoped-var': ['error'],
		// 'default-case': ['error'],
		// 'default-param-last': ['error'],
		// 'dot-location': ['error', 'property'],
		// eqeqeq: ['error'],
		// 'no-eval': ['error'],
		// 'no-eq-null': ['error'],
		// 'no-floating-decimal': ['error'],
		// 'no-trailing-spaces': ['error'],
		// 'brace-style': [2, '1tbs', { allowSingleLine: true }],
		// 'no-mixed-operators': [
		// 	'error',
		// 	{
		// 		groups: [
		// 			['&', '|', '^', '~', '<<', '>>', '>>>'],
		// 			['==', '!=', '===', '!==', '>', '>=', '<', '<='],
		// 			['&&', '||'],
		// 			['in', 'instanceof'],
		// 		],
		// 		allowSamePrecedence: true,
		// 	},
		// ],
		// 'no-underscore-dangle': ['error', {
		// 	allowAfterThis: true,
		// }],
		// 'no-bitwise': 0,
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				ts: 'never',
				js: 'never',
			},
		],
		// the following are handled by the typescript parser
		'lines-between-class-members': 'off',
	},
	ignorePatterns: [
		'*.min.js',
		'dist/**',
	],
};
