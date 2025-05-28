export default {
	preset: 'jest-puppeteer',
	roots: [
		'<rootDir>/src/js/__tests__',
		'<rootDir>/e2e',
	],
	testMatch: [
		'**/?(*.)+(spec|test).[jt]s?(x)',
	],
	testPathIgnorePatterns: [
		'/node_modules/',
		'/.history/',
		'/__snapshots__/',
		'/dist/',
		'/build/',
	],
	moduleFileExtensions: [
		'js',
		'json',
	],
	moduleNameMapper: {
		'\\.css$': '<rootDir>/src/js/__mocks__/styleMock.js',
		'^(\\.{1,2}/.*)\\.js': '$1',
	},
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
	globals: {
		'ts-jest': {
			useESM: true,
		},
	},
	testEnvironment: 'jsdom',
	projects: [
		{
			displayName: 'unit & JSDOM',
			testMatch: ['<rootDir>/src/js/__tests__/**/*.test.js'],
			testEnvironment: 'jsdom',
			moduleNameMapper: {
				'\\.css$': '<rootDir>/src/js/__mocks__/styleMock.js',
				'^(\\.{1,2}/.*)\\.js': '$1',
			},
			transform: {
				'^.+\\.js$': 'babel-jest',
			},
			transformIgnorePatterns: [
				'node_modules/(?!.*\\.mjs$)',
			],
		},
		{
			displayName: 'e2e',
			preset: 'jest-puppeteer',
			testMatch: ['<rootDir>/e2e/**/*.test.js'],
			testEnvironment: 'jest-environment-puppeteer',
		},
	],
	transformIgnorePatterns: [
		'node_modules/(?!.*\\.mjs$)',
	],
};
